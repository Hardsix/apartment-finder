import * as bluebird from "bluebird";
import * as _ from "lodash";
import { JSDOM } from "jsdom";
import { URL } from "url";
import { ParsedApartmentData } from "~/scraper-job/types";
import { fetchUrlInStealth } from "../stealth-browser.service";
import { Injectable } from "@nestjs/common";
import { ApartmentService } from "~/apartment/services/apartment.service";

function isProcessed(pubDate: Date, lastProcessedDate: Date) {
  // also cover case when pub date does not exist

  // in index the dates are without specific time, so we
  // need to treat anything on the same date as already processed
  // unless we want to wait for up to 24 hours to stop re-processing the same links
  return !pubDate || pubDate < lastProcessedDate;
}

/**
 * Removes trash from page text content
 * @param content Raw source of page
 */
function cleanUpContent(content: string) {
  const cleanContent = content
    .replace(new RegExp("`"), '"')
    .replace(new RegExp("<style.*\n\n@charset.*\n\n.*"), "");
  return cleanContent;
}

function getAbsoluteLink(link: string) {
  if (!link) return undefined;

  if (link.indexOf("index.hr") !== -1) {
    return link;
  } else {
    return `https://www.index.hr${link}`;
  }
}

@Injectable()
class IndexScraperService {
  constructor(private readonly apartmentRepo: ApartmentService) {}

  /**
   * Extracts all apartment links from list url and subsequent pages
   * @param url
   * @param fetchAllPages
   * @param pageIndex
   * @param processNewerThan
   * @param maxPages
   * @returns
   */
  async extractIndexApartmentLinksFromPage(
    url: string,
    fetchAllPages = true,
    pageIndex = 1,
    processNewerThan: Date = undefined,
    maxPages: number = undefined
  ): Promise<string[]> {
    const content = cleanUpContent(await fetchUrlInStealth(url));
    if (!maxPages) {
      const dom = await new JSDOM(cleanUpContent(content));
      const pagination = dom.window.document.querySelectorAll(
        ".pagination > li > a"
      );
      const lastPageHref = getAbsoluteLink(pagination[6]?.href);

      if (lastPageHref) {
        const lastPageUrl = new URL(lastPageHref);
        const lastPageNum = parseInt(lastPageUrl.searchParams.get("num"));
        if (lastPageNum) {
          maxPages = lastPageNum;
        }
      }

      if (!maxPages) {
        maxPages = 1;
      }
    }

    let apartmentLinksToProcess = await this.getApartmentLinksFromContent(
      content,
      processNewerThan
    );

    if (
      _.size(apartmentLinksToProcess) > 0 &&
      fetchAllPages &&
      pageIndex < maxPages
    ) {
      const newUrl = new URL(url);
      // const currentPage = parseInt(newUrl.searchParams.get('num'))
      newUrl.searchParams.delete("num");
      newUrl.searchParams.append("num", `${pageIndex + 1}`);

      apartmentLinksToProcess = apartmentLinksToProcess.concat(
        await this.extractIndexApartmentLinksFromPage(
          newUrl.toString(),
          true,
          pageIndex + 1,
          processNewerThan,
          maxPages
        )
      );
    }

    return apartmentLinksToProcess;
  }

  async getApartmentLinksFromContent(
    content: string,
    processNewerThan: Date = undefined
  ) {
    const dom = await new JSDOM(cleanUpContent(content));

    const aptLinksProxy = dom.window.document.querySelectorAll(".result");
    const aptLinks = _.map(aptLinksProxy, (aptLink) =>
      getAbsoluteLink(aptLink.href)
    );

    const pubDatesProxy = dom.window.document.querySelectorAll(
      ".result .icon-time"
    );
    const pubDates = _.map(pubDatesProxy, (pubDateRaw) => {
      const tokens = _.split(_.trim(pubDateRaw.textContent), " ");
      const [day, month, year] = _.map(
        _.split(tokens[_.size(tokens) - 1], "."),
        (num) => parseInt(num)
      );
      return new Date(year, month, day);
    });

    const apartmentLinkData: { link: string; date: Date }[] = [];
    for (let i = 0; i < aptLinks.length; i++) {
      apartmentLinkData.push({
        link: aptLinks[i],
        date: pubDates[i],
      });
    }

    const apartmentLinksToProcess: string[] = [];
    for (const linkAndDate of apartmentLinkData) {
      const dateIsNew =
        !processNewerThan || !isProcessed(linkAndDate.date, processNewerThan);
      if (!dateIsNew) {
        continue;
      }

      const existingApartmentWithUrl = await this.apartmentRepo.find({
        where: { url: linkAndDate.link },
      });
      if (_.size(existingApartmentWithUrl) > 0) {
        continue;
      }

      apartmentLinksToProcess.push(linkAndDate.link);
    }

    return apartmentLinksToProcess;
  }

  /**
   * Scrapes apartment details from given url
   * @param url
   * @returns
   */
  async extractSingleApartmentDataFromIndexPage(
    url: string
  ): Promise<ParsedApartmentData> {
    console.log(`Parsing apartment in url ${url}`);

    const content = await fetchUrlInStealth(url);
    const data = this.extractSingleApartmentDataFromIndexPageContent(content);

    return data;
  }

  /**
   * Extracts data for one apartment from its details page
   * @param content
   * @returns
   */
  async extractSingleApartmentDataFromIndexPageContent(
    content: string
  ): Promise<ParsedApartmentData> {
    const dom = await new JSDOM(cleanUpContent(content));
    const document = dom.window.document;

    const name = _.trim(
      document.querySelector(
        "#PrintOglasContent > div:nth-child(2) > h1:nth-child(1)"
      )?.textContent
    );

    const adCodeRaw = document.querySelector(
      "#PrintOglasContent > div:nth-child(2) > div:nth-child(3) > strong:nth-child(1)"
    )?.textContent;
    const advertisementCode = _.trim(adCodeRaw);

    const priceRaw = document
      .querySelector(".price")
      .textContent.match(/([0-9]+[\.]?[0-9]*) €/)[1];

    const detailGroups = document.querySelectorAll(".features-wrapper");
    const listItems = _.flatten(
      _.map(detailGroups, (group) =>
        _.map(group.querySelectorAll("li"), (innerGroup) =>
          _.trim(innerGroup.textContent)
        )
      )
    );

    const details = {};
    for (let i = 0; i < listItems.length; i += 2) {
      details[listItems[i]] = listItems[i + 1];
    }

    const result: ParsedApartmentData = {
      name: _.trim(name),
      advertisementCode: _.trim(advertisementCode),
      bedroomCount: _.toNumber(details["Broj soba"]),
      city: details["Županija"],
      neighbourhood: details["Grad/općina"],
      locationInNeighbourhood: details["Naselje"],
      floor: _.toNumber(details["Kat"]),
      squareMeters: _.toNumber(details["Stambena površina u m2"]),
      priceEuros: _.toNumber(_.replace(priceRaw, ".", "")),
      yearBuilt: _.toNumber(details["Godina izgradnje"]),
      yearRenovated: _.toNumber(details["Godina zadnje adaptacije"]),
    };

    if (
      result.yearBuilt === 0 ||
      _.isNaN(result.yearBuilt) ||
      result.yearBuilt === null
    ) {
      delete result.yearBuilt;
    }

    if (
      result.yearRenovated === 0 ||
      _.isNaN(result.yearRenovated) ||
      result.yearRenovated === null
    ) {
      delete result.yearRenovated;
    }

    if (result.floor === 0 || _.isNaN(result.floor) || result.floor === null) {
      delete result.floor;
    }

    if (
      result.bedroomCount === 0 ||
      _.isNaN(result.bedroomCount) ||
      result.bedroomCount === null
    ) {
      delete result.bedroomCount;
    }

    return result;
  }

  /**
   * Extracts all new apartment data from given index url and subsequent pages
   * @param name
   * @param url
   * @param processNewerThan
   * @returns
   */
  async extractApartmentsDataFromPage(
    name,
    url: string,
    processNewerThan: Date
  ): Promise<{ link: string; data: ParsedApartmentData }[]> {
    try {
      console.log(
        `[${name} - ${new Date()}] Processing scraper with options:\n${JSON.stringify(
          {
            url,
            processNewerThan,
          },
          null,
          2
        )}`
      );
      const apartmentLinks = await this.extractIndexApartmentLinksFromPage(
        url,
        true,
        1,
        processNewerThan
      );
      console.log(
        `[${name} - ${new Date()}] Located ${
          apartmentLinks.length
        } links to process`
      );

      const apartmentsData: {
        link: string;
        data: ParsedApartmentData;
      }[] = await bluebird.mapSeries(apartmentLinks, async (link: string) => {
        const data: ParsedApartmentData = await this.extractSingleApartmentDataFromIndexPage(
          link
        );

        return {
          link,
          data,
        };
      });
      console.log(
        `[${name} - ${new Date()}] Processed data for ${
          apartmentsData.length
        } apartments`
      );

      return apartmentsData;
    } catch (err) {
      console.log(
        `[${name} - ${new Date()}] Encountered error:\n${JSON.stringify(
          {
            message: err.message,
            stack: err.stack,
            err,
            name,
            url,
            processNewerThan,
          },
          null,
          2
        )}`
      );
    }
  }
}

export { IndexScraperService };
