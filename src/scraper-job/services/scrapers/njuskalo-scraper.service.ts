import * as bluebird from "bluebird";
import * as _ from "lodash";
import { JSDOM, VirtualConsole } from "jsdom";
import { ParsedApartmentData } from "~/scraper-job/types";
import { fetchUrlInStealth } from "../stealth-browser.service";

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", () => {
  // No-op to skip console errors.
});

function isProcessed(pubDate: Date, lastProcessedDate: Date) {
  // also cover case when pub date does not exist
  return !pubDate || pubDate < lastProcessedDate;
}

async function extractNjuskaloApartmentLinksFromPage(
  url: string,
  fetchAllPages = true,
  pageIndex = 1,
  processNewerThan: Date = undefined,
  maxPages: number = undefined
): Promise<string[]> {
  if (!maxPages) maxPages = 50;

  const content = await fetchUrlInStealth(url);

  const dom = await new JSDOM(content, { virtualConsole });

  const aptLinksProxy = dom.window.document.querySelectorAll(
    ".content-main .EntityList-item .entity-body .entity-title .link"
  );
  let aptLinks = _.map(
    aptLinksProxy,
    (aptLink) => `https://njuskalo.hr${aptLink.href}`
  );

  const pubDatesProxy = dom.window.document.querySelectorAll(
    ".content-main .EntityList-item .entity-body .entity-pub-date .date--full"
  );
  let pubDates = _.map(pubDatesProxy, (pubDate) => new Date(pubDate.dateTime));

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

  if (
    _.size(apartmentLinksToProcess) > 0 &&
    fetchAllPages &&
    pageIndex < maxPages
  ) {
    const newPageUrl = `${url}&page=${pageIndex + 1}`;
    apartmentLinksToProcess = apartmentLinksToProcess.concat(
      await extractNjuskaloApartmentLinksFromPage(
        newPageUrl,
        true,
        pageIndex + 1,
        processNewerThan
      )
    );
  }

  return apartmentLinksToProcess;
}

async function extractSingleApartmentDataFromNjuskaloPage(
  url: string
): Promise<ParsedApartmentData> {
  console.log(`Parsing apartment in url ${url}`);

  const content = await fetchUrlInStealth(url);
  const data = extractSingleApartmentDataFromNjuskaloPageContent(content);

  return data;
}

async function extractSingleApartmentDataFromNjuskaloPageContent(
  content: string
): Promise<ParsedApartmentData> {
  const dom = await new JSDOM(content, { virtualConsole });
  const document = dom.window.document;

  const name = document.querySelector(".ClassifiedDetailSummary-title")
    .textContent;

  const adCodeRaw = document.querySelector(".ClassifiedDetailSummary-adCode")
    .textContent;
  const advertisementCode = _.trim(_.split(adCodeRaw, ":")[1]);

  const priceRawElement = document.querySelector(
    ".ClassifiedDetailSummary-priceDomestic"
  ) || document.querySelector(
    ".ClassifiedDetailSummary-priceForeign"
  );
  const priceRaw = priceRawElement.textContent
  const priceRegex = /([0-9\.,]+)\s\u20AC/gm;

  const priceMatch = priceRegex.exec(priceRaw);

  const priceEuros = priceMatch[1];

  const basicDetailsRaw = document.querySelector(
    ".ClassifiedDetailBasicDetails-list"
  ).children;
  const basicDetailsPairs: any[] = _.chunk(basicDetailsRaw, 2);
  const basicDetails = {};
  _.forEach(basicDetailsPairs, (pair) => {
    const [keyElem, valElem] = pair;
    basicDetails[_.trim(keyElem.textContent)] = _.trim(valElem.textContent);
  });

  const trimmedFloor = _.trim(basicDetails["Kat"], ".");
  const floorRaw = trimmedFloor === "Visoko prizemlje" ? "0" : trimmedFloor;
  const result: ParsedApartmentData = {
    name,
    advertisementCode,
    bedroomCount: _.toNumber(_.split(basicDetails["Broj soba"], "-")[0]),
    city: _.split(basicDetails["Lokacija"], ",")[0],
    neighbourhood: _.trim(_.split(basicDetails["Lokacija"], ",")[1]),
    locationInNeighbourhood: _.trim(_.split(basicDetails["Lokacija"], ",")[2]),
    floor: _.toNumber(floorRaw),
    squareMeters: _.toNumber(
      _.replace(_.trim(basicDetails["Stambena površina"], " m²"), ",", ".")
    ),
    priceEuros: _.toNumber(_.replace(priceEuros, ".", "")),
    yearBuilt: _.toNumber(_.replace(basicDetails["Godina izgradnje"], ".", "")),
    yearRenovated: _.toNumber(
      _.replace(basicDetails["Godina zadnje renovacije"], ".", "")
    ),
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
    const apartmentLinks = await extractNjuskaloApartmentLinksFromPage(
      url,
      true,
      1,
      processNewerThan
    );
    console.log(
      `[${name} - ${new Date()}] Located ${apartmentLinks.length
      } links to process`
    );

    const apartmentsData: {
      link: string;
      data: ParsedApartmentData;
    }[] = await bluebird.mapSeries(apartmentLinks, async (link: string) => {
      const data: ParsedApartmentData = await extractSingleApartmentDataFromNjuskaloPage(
        link
      );

      return {
        link,
        data,
      };
    });
    console.log(
      `[${name} - ${new Date()}] Processed data for ${apartmentsData.length
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
  extractSingleApartmentDataFromNjuskaloPageContent,
};
