import * as _ from "lodash";
import { ParsedApartmentData, ScraperJobType } from "../types";
import {
  getApartmentsFromIndexPage,
  getApartmentsFromNjuskaloPage,
} from "./scrapers";

async function scrapeApartments(
  name,
  url: string,
  processNewerThan: Date,
  type: ScraperJobType = "njuskalo"
): Promise<{ link: string; data: ParsedApartmentData }[]> {
  if (type === "njuskalo") {
    return await getApartmentsFromNjuskaloPage(name, url, processNewerThan);
  } else if (type === "index") {
    console.log(`Calling index scraper`);
    return await getApartmentsFromIndexPage(name, url, processNewerThan);
  }

  throw new Error(`Scraper not implemented for type ${type}`);
}

export { scrapeApartments };
