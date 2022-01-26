import { Injectable } from "@nestjs/common";
import * as _ from "lodash";
import { ParsedApartmentData, ScraperJobType } from "../types";
import { IndexScraperService, getApartmentsFromNjuskaloPage } from "./scrapers";

@Injectable()
class ScraperService {
  constructor(private readonly indexScraper: IndexScraperService) {}

  async scrapeApartments(
    name,
    url: string,
    processNewerThan: Date,
    type: ScraperJobType = "njuskalo"
  ): Promise<{ link: string; data: ParsedApartmentData }[]> {
    if (type === "njuskalo") {
      return await getApartmentsFromNjuskaloPage(name, url, processNewerThan);
    } else if (type === "index") {
      console.log(`Calling index scraper`);
      return await this.indexScraper.extractApartmentsDataFromPage(
        name,
        url,
        processNewerThan
      );
    }

    throw new Error(`Scraper not implemented for type ${type}`);
  }
}

export { ScraperService };
