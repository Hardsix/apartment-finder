import { launchPuppeteer } from "apify";
import * as _ from "lodash";

const stealthFetchSleepBaselineMs = 3000;

const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};

let browser;
async function getBrowser() {
  if (browser) {
    return browser;
  }

  browser = await launchPuppeteer({
    stealth: true,
  });

  return browser;
}

async function fetchUrlInStealth(url: string): Promise<string> {
  await sleep(_.floor((1 + Math.random()) * stealthFetchSleepBaselineMs));

  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.goto(url);
  const content = await page.content();
  await page.close();

  return content;
}

export { fetchUrlInStealth };
