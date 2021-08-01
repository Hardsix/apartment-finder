import { extractSingleApartmentDataFromNjuskaloPageContent } from '../scraper.service'
import * as apartment1Text from './apartment1'

describe('Scraper Service', () => {
  beforeEach(async () => {
  })

  it('should parse apartment page correctly given text content', async () => {
    const data = await extractSingleApartmentDataFromNjuskaloPageContent(apartment1Text)

    expect(data).toBeTruthy()

    expect(data).toMatchObject({
      name: "Kvatrić, Sermageova ul., 43 m2, praktičan stan na izuzetnoj lokaciji (prodaja)",
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
    })
  })
})
