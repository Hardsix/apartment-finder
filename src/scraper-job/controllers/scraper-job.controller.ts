import * as _ from 'lodash'
import * as bluebird from 'bluebird'
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ScraperJob } from "../entities/scraper-job.entity";
import { ScraperJobService } from "../services/scraper-job.service";
import { extractApartmentsDataFromNjuskaloPage, extractNjuskaloApartmentLinksFromPage } from '../services/scraper.service';
import { ApartmentService } from '~/apartment/services/apartment.service';

@Controller("scraperJob")
export class ScraperJobController {
  constructor(private readonly scraperJobService: ScraperJobService, private readonly apartmentService: ApartmentService) {}

  @Get('/:scraperJobId')
  async get(@Param('scraperJobId') scraperJobId: string): Promise<ScraperJob> {
    const scraperJob = await this.scraperJobService.findOne(scraperJobId)
    return scraperJob
  }

  @Post('')
  async create(@Body() scraperJobBody: Partial<ScraperJob>) {
    const scraperJob = await this.scraperJobService.create(scraperJobBody)

    const data = await extractApartmentsDataFromNjuskaloPage(scraperJob.url)
    await bluebird.mapSeries(data, async (item) => {
      return await this.apartmentService.saveWithSoftEqual({
        ...item.data,
        url: item.link,
      })
    })

    return {
      scraperJob,
    }
  }
}
