import * as apartment1Text from "./njuskalo-apartment1";
import * as apartment2Text from "./njuskalo-apartment2";
import { extractSingleApartmentDataFromNjuskaloPageContent } from "../njuskalo-scraper.service";

describe("Njuskalo Scraper Service", () => {
  beforeEach(async () => {});

  it("should parse njuskalo apartment page correctly given text content", async () => {
    const data = await extractSingleApartmentDataFromNjuskaloPageContent(
      apartment1Text
    );

    expect(data).toBeTruthy();

    expect(data).toMatchObject({
      name:
        "Kvatrić, Sermageova ul., 43 m2, praktičan stan na izuzetnoj lokaciji (prodaja)",
      advertisementCode: "35136413",
      bedroomCount: 2,
      city: "Grad Zagreb",
      neighbourhood: "Maksimir",
      locationInNeighbourhood: "Maksimir",
      floor: 2,
      squareMeters: 43.4,
      priceEuros: 113950,
      yearBuilt: 1937,
      yearRenovated: 2019,
    });
  });

  it("should parse njuskalo post-euro apartment page correctly given text content", async () => {
    const data = await extractSingleApartmentDataFromNjuskaloPageContent(
      apartment2Text
    );

    expect(data).toBeTruthy();

    expect(data).toMatchObject({
      name:
        "Velika Gorica, centar, stan 88 m2, okućnica, parking (prodaja)",
      advertisementCode: "38478065",
      bedroomCount: 3,
      city: "Zagrebačka",
      neighbourhood: "Velika Gorica",
      locationInNeighbourhood: "Centar",
      squareMeters: 87.72,
      priceEuros: 114900,
    });
  });
});
