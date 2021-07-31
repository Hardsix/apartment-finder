import * as _ from 'lodash'
import * as puppeteer from 'puppeteer'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ScraperJob } from "../entities/scraper-job.entity";
import { ScraperJobService } from "../services/scraper-job.service";

@Controller("scraperJob")
export class ScraperJobController {
  constructor(private readonly scraperJobService: ScraperJobService) {}

  @Get('/:scraperJobId')
  async get(@Param('scraperJobId') scraperJobId: string): Promise<ScraperJob> {
    const scraperJob = await this.scraperJobService.findOne(scraperJobId)
    return scraperJob
  }

  async extractNjuskaloBasicData(url: string) {
    // const response = await fetch(url);

    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    await page.goto(url);
    const content = await page.content()

    const a = 5

    // const text = await response.text();
    const dom = await new JSDOM(content);

    const aptLinksProxy = dom.window.document.querySelectorAll('.EntityList-item .entity-body .entity-title .link')
    const aptLinks = _.map(aptLinksProxy, (aptLink) => `https://njuskalo.hr${aptLink.href}`)

    return {
      aptLinks
    }
  }

  @Post('')
  async create(@Body() scraperJobBody: Partial<ScraperJob>) {
    const scraperJob = await this.scraperJobService.create(scraperJobBody)

    const basicData = await this.extractNjuskaloBasicData(scraperJob.url)

    return {
      scraperJob,
      basicData,
    }
  }
}
