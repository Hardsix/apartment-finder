import * as bluebird from "bluebird";
import * as _ from "lodash";
import { JSDOM } from "jsdom";
import { URL } from "url";
import { ParsedApartmentData } from "~/scraper-job/types";
import { fetchUrlInStealth } from "../stealth-browser.service";

function isProcessed(pubDate: Date, lastProcessedDate: Date) {
  // also cover case when pub date does not exist
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

/**
 * Extracts all apartment links from list url and subsequent pages
 * @param url
 * @param fetchAllPages
 * @param pageIndex
 * @param processNewerThan
 * @param maxPages
 * @returns
 */
async function extractIndexApartmentLinksFromPage(
  url: string,
  fetchAllPages = true,
  pageIndex = 1,
  processNewerThan: Date = undefined,
  maxPages: number = undefined
): Promise<string[]> {
  if (!maxPages) maxPages = 50;

  const content = await fetchUrlInStealth(url);

  let apartmentLinksToProcess = await getApartmentLinksFromContent(
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
      await extractIndexApartmentLinksFromPage(
        newUrl.toString(),
        true,
        pageIndex + 1,
        processNewerThan
      )
    );
  }

  return apartmentLinksToProcess;
}

async function getApartmentLinksFromContent(
  content: string,
  processNewerThan: Date = undefined
) {
  const dom = await new JSDOM(cleanUpContent(content));

  const aptLinksProxy = dom.window.document.querySelectorAll(".result");
  const aptLinks = _.map(aptLinksProxy, (aptLink) => aptLink.href);

  const pubDatesProxy = dom.window.document.querySelectorAll(
    ".result .icon-time"
  );
  const pubDates = _.map(pubDatesProxy, (pubDateRaw) => {
    const tokens = _.split(_.trim(pubDateRaw.dateTime), " ");
    const [day, month, year] = _.map(
      _.split(tokens[_.size(tokens) - 1], "."),
      parseInt
    );
    return new Date(year, month, day);
  });

  const apartmentLinkData = [];
  for (let i = 0; i < aptLinks.length; i++) {
    apartmentLinkData.push({
      link: aptLinks[i],
      date: pubDates[i],
    });
  }

  let apartmentLinksToProcess: string[] = _.map(
    _.filter(
      apartmentLinkData,
      (data) => !processNewerThan || !isProcessed(data.date, processNewerThan)
    ),
    (apt) => apt.link
  );

  return apartmentLinksToProcess;
}

/**
 * Scrapes apartment details from given url
 * @param url
 * @returns
 */
async function extractSingleApartmentDataFromIndexPage(
  url: string
): Promise<ParsedApartmentData> {
  console.log(`Parsing apartment in url ${url}`);

  const content = await fetchUrlInStealth(url);
  const data = extractSingleApartmentDataFromIndexPageContent(content);

  return data;
}

/**
 * Extracts data for one apartment from its details page
 * @param content
 * @returns
 */
async function extractSingleApartmentDataFromIndexPageContent(
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

  if (result.yearBuilt === 0) {
    delete result.yearBuilt;
  }

  if (_.isNaN(result.floor) || result.floor === null) {
    delete result.floor;
  }

  if (_.isNaN(result.bedroomCount) || result.bedroomCount === null) {
    delete result.bedroomCount;
  }

  if (result.yearRenovated === 0) {
    delete result.yearRenovated;
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
async function extractApartmentsDataFromPage(
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
    const apartmentLinks = await extractIndexApartmentLinksFromPage(
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
      const data: ParsedApartmentData = await extractSingleApartmentDataFromIndexPage(
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

export {
  extractApartmentsDataFromPage,
  extractSingleApartmentDataFromIndexPageContent,
  getApartmentLinksFromContent,
};
