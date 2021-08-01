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

let browser
async function getBrowser() {
  if (browser) {
    return browser
  }

  browser = await launchPuppeteer({ stealth: true });  
  return browser
}

async function fetchUrlInStealth(url: string): Promise<string> {
  await sleep(_.floor((1 + Math.random()) * 2000))

  const browser = await getBrowser()
  const page = await browser.newPage();
  
  await page.goto(url);
  const content = await page.content()
  await page.close();

  return content
}

function isProcessed(pubDate: Date, lastProcessedDate: Date) {
  return pubDate < lastProcessedDate
}

async function extractNjuskaloApartmentLinksFromPage(url: string, fetchAllPages = true, pageIndex = 1, processNewerThan: Date = undefined) {
  const content = await fetchUrlInStealth(url)

  const dom = await new JSDOM(content);

  const aptLinksProxy = dom.window.document.querySelectorAll('.content-main .EntityList-item .entity-body .entity-title .link')
  let aptLinks = _.map(aptLinksProxy, (aptLink) => `https://njuskalo.hr${aptLink.href}`)

  const pubDatesProxy = dom.window.document.querySelectorAll('.content-main .EntityList-item .entity-body .entity-pub-date .date--full')
  let pubDates = _.map(pubDatesProxy, (pubDate) => new Date(pubDate.dateTime))

  const apartmentLinkData = []
  for (let i = 0; i < aptLinks.length; i++) {
    apartmentLinkData.push({
      link: aptLinks[i],
      date: pubDates[i]
    })
  }

  let apartmentLinksToProcess = _.map(
    _.filter(apartmentLinkData, (data) => !processNewerThan || !isProcessed(data.date, processNewerThan)), (apt) => apt.link
  )

  if (_.size(apartmentLinksToProcess) > 0 && fetchAllPages) {
    const newPageUrl = `${url}&page=${pageIndex + 1}`
    apartmentLinksToProcess = apartmentLinksToProcess.concat(await extractNjuskaloApartmentLinksFromPage(newPageUrl, true, pageIndex + 1, processNewerThan))
  }

  return apartmentLinksToProcess
}

async function extractSingleApartmentDataFromNjuskaloPage(url: string): Promise<Partial<Apartment>> {
  console.log(`Parsing apartment in url ${url}`)

  const content = await fetchUrlInStealth(url)
  const data = extractSingleApartmentDataFromNjuskaloPageContent(content)

  return data
}

async function extractSingleApartmentDataFromNjuskaloPageContent(content: string): Promise<Partial<Apartment>> {
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

  if (result.yearBuilt === 0) {
    delete result.yearBuilt
  }

  if (result.yearRenovated === 0) {
    delete result.yearRenovated
  }

  return result
}

async function extractApartmentsDataFromNjuskaloPage(url: string, processNewerThan: Date) {
  const apartmentLinks = await extractNjuskaloApartmentLinksFromPage(url, true, 1, processNewerThan)

  const apartmentsData = await bluebird.mapSeries(apartmentLinks, async (link) => {
    const data = await extractSingleApartmentDataFromNjuskaloPage(link)

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