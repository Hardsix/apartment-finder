import * as apartmentList1 from "./index-list1";
import * as apartment1Text from "./index-apartment1";
import * as apartment2Text from "./index-apartment2";

import {
  IndexScraperService,
} from "../index-scraper.service";
import { ParsedApartmentData } from "~/scraper-job/types";

describe("Index Scraper Service", () => {
  beforeEach(async () => {});

  const fakeRepo: any = {
    find: jest.fn(() => Promise.resolve([]))
  }

  const scraper = new IndexScraperService(fakeRepo)

  it.each([
    [
      apartment1Text,
      {
        name: "Stan na Srednjacima, 67 m2 + 42 m2 terase, 3 s",
        advertisementCode: "3297233",
        bedroomCount: 3,
        city: "Grad Zagreb",
        neighbourhood: "Trešnjevka - Jug",
        locationInNeighbourhood: "Srednjaci",
        floor: 10,
        squareMeters: 67,
        priceEuros: 179000,
        yearBuilt: 2000,
        yearRenovated: 2015,
      },
    ],
    [
      apartment2Text,
      {
        name: "Stan Maksimir Ravnice",
        advertisementCode: "3297634",
        bedroomCount: 2,
        city: "Grad Zagreb",
        neighbourhood: "Maksimir",
        locationInNeighbourhood: "Ravnice",
        floor: 9,
        squareMeters: 63,
        priceEuros: 130000,
        yearBuilt: 1976,
        yearRenovated: 1978,
      },
    ],
  ])(
    "should parse index apartment page correctly given text content",
    async (text: string, expectedData: ParsedApartmentData) => {
      const data = await scraper.extractSingleApartmentDataFromIndexPageContent(text);

      expect(data).toBeTruthy();

      expect(data).toMatchObject({
        name: expectedData.name,
        advertisementCode: expectedData.advertisementCode,
        bedroomCount: expectedData.bedroomCount,
        city: expectedData.city,
        neighbourhood: expectedData.neighbourhood,
        locationInNeighbourhood: expectedData.locationInNeighbourhood,
        floor: expectedData.floor,
        squareMeters: expectedData.squareMeters,
        priceEuros: expectedData.priceEuros,
        yearBuilt: expectedData.yearBuilt,
        yearRenovated: expectedData.yearRenovated,
      });
    }
  );

  it.each([
    [
      apartmentList1,
      [
        "https://www.index.hr/oglasi/stan-donji-grad/oid/3297707",
        "https://www.index.hr/oglasi/stan-maksimir-ravnice/oid/3297634",
        "https://www.index.hr/oglasi/vrbik-prodaja-dvosobni-66-m2/oid/3297621",
        "https://www.index.hr/oglasi/stan-tresnjevka-sjever-tresnjevka/oid/3297601",
        "https://www.index.hr/oglasi/stan-sesvete-popovec/oid/3297396",
        "https://www.index.hr/oglasi/studentski-grad--ljevakoviceva---razizemlje--1-sob--36-46-m2---65000--/oid/3119168",
        "https://www.index.hr/oglasi/stan-na-srednjacima-67-m2-42-m2-terase-3-s/oid/3297233",
        "https://www.index.hr/oglasi/stan-zagreb-vrapce-60-m2-16-m2-garaza-vrt-manterovcak-prodaja/oid/3297109",
        "https://www.index.hr/oglasi/stan-maksimir-remete/oid/3297100",
        "https://www.index.hr/oglasi/stan-gornja-dubrava-klaka/oid/3296949",
      ],
    ],
  ])(
    "should parse index list page correctly given text content",
    async (text: string, expectedLinks: string[]) => {
      const links = await scraper.getApartmentLinksFromContent(text);

      expect(links).toBeTruthy();

      expect(links).toEqual(expectedLinks);
    }
  );
});
