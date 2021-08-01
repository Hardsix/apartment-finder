import * as bluebird from 'bluebird'
import { launchPuppeteer } from 'apify'
import * as _ from 'lodash'
import { JSDOM } from 'jsdom'
import { Apartment } from '~/apartment/entities/apartment.entity';

const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

async function fetchUrlInStealth(url: string): Promise<string> {
  const browser = await launchPuppeteer({ stealth: true });
  const page = await browser.newPage();
  
  await page.goto(url);
  const content = await page.content()
  await page.close();
  await browser.close();

  return content
}

async function extractNjuskaloApartmentLinksFromPage(url: string) {
  const content = await fetchUrlInStealth(url)

  const dom = await new JSDOM(content);

  const aptLinksProxy = dom.window.document.querySelectorAll('.EntityList-item .entity-body .entity-title .link')
  const aptLinks = _.map(aptLinksProxy, (aptLink) => `https://njuskalo.hr${aptLink.href}`)

  return aptLinks
}

async function extractSingleApartmentDataFromNjuskaloPage(url: string): Promise<Partial<Apartment>> {
  const content = await fetchUrlInStealth(url)
  const data = extractSingleApartmentDataFromNjuskaloPageContent(content)

  return data
}

async function extractSingleApartmentDataFromNjuskaloPageContent(content: string): Promise<Partial<Apartment>> {
  const a = _

  const dom = await new JSDOM(content);
  const document = dom.window.document

  const name = document.querySelector('.ClassifiedDetailSummary-title').textContent

  const adCodeRaw = document.querySelector('.ClassifiedDetailSummary-adCode').textContent
  const advertisementCode = _.trim(_.split(adCodeRaw, ':')[1])

  const priceRaw = document.querySelector('.ClassifiedDetailSummary-priceForeign').textContent
  const priceRegex = /([0-9.]+)/
  const priceMatch = priceRegex.exec(priceRaw)
  const priceEuros = priceMatch[0]

  const basicDetailsRaw = document.querySelector('.ClassifiedDetailBasicDetails-list').children
  const basicDetailsPairs: any[] = _.chunk(basicDetailsRaw, 2)
  const basicDetails = {}
  _.forEach(basicDetailsPairs, (pair) => {
    const [keyElem, valElem] = pair
    basicDetails[_.trim(keyElem.textContent)] = _.trim(valElem.textContent)
  })

  const result: Partial<Apartment> = {
    name,
    advertisementCode,
    bedroomCount: _.toNumber(_.split(basicDetails['Broj soba'], '-')[0]),
    city: _.split(basicDetails['Lokacija'], ',')[0],
    neighbourhood: _.trim(_.split(basicDetails['Lokacija'], ',')[1]),
    locationInNeighbourhood: _.trim(_.split(basicDetails['Lokacija'], ',')[2]),
    floor: _.toNumber(_.trim(basicDetails['Kat'], '.')),
    squareMeters: _.toNumber(_.replace(_.trim(basicDetails['Stambena površina'], ' m²'), ',', '.')),
    priceEuros: _.toNumber(_.replace(priceEuros, '.', '')),
    yearBuilt: _.toNumber(_.replace(basicDetails['Godina izgradnje'], '.', '')),
    yearRenovated: _.toNumber(_.replace(basicDetails['Godina zadnje renovacije'], '.', '')),
  }

  return result
}

async function extractApartmentsDataFromNjuskaloPage(url: string) {
  const apartmentLinks = await extractNjuskaloApartmentLinksFromPage(url)

  const apartmentsData = await bluebird.mapSeries(apartmentLinks, async (link) => {
    const data = await extractSingleApartmentDataFromNjuskaloPage(link)
    await sleep(1100)

    return {
      link,
      data,
    }
  })

  return apartmentsData
}

export {
  extractSingleApartmentDataFromNjuskaloPageContent,
  extractNjuskaloApartmentLinksFromPage,
  extractApartmentsDataFromNjuskaloPage,
}