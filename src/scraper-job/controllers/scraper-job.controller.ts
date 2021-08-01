import * as _ from 'lodash'
import * as bluebird from 'bluebird'
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ScraperJob } from "../entities/scraper-job.entity";
import { ScraperJobService } from "../services/scraper-job.service";
import { extractApartmentsDataFromNjuskaloPage } from '../services/scraper.service';
import { ApartmentService } from '~/apartment/services/apartment.service';

@Controller("scraperJob")
export class ScraperJobController {
  constructor(private readonly scraperJobService: ScraperJobService, private readonly apartmentService: ApartmentService) {}

  @Get('/:scraperJobId')
  async get(@Param('scraperJobId') scraperJobId: string): Promise<ScraperJob> {
    const scraperJob = await this.scraperJobService.findOne(scraperJobId)
    return scraperJob
  }

  async processScraperJob(scraperJob: ScraperJob) {
    const data = await extractApartmentsDataFromNjuskaloPage(scraperJob.url, scraperJob.lastProcessed)
    await bluebird.mapSeries(data, async (item) => {
      return await this.apartmentService.saveWithSoftEqual({
        ...item.data,
        url: item.link,
      })
    })

    const newJobState = await this.scraperJobService.update(scraperJob.id, { lastProcessed: new Date() })
    return newJobState
  }

  @Post('/:scraperJobId/process')
  async manuallyProcessScraperJob(@Param('scraperJobId') scraperJobId: string) {
    const scraperJob = await this.scraperJobService.findOne(scraperJobId)

    const newJobState = await this.processScraperJob(scraperJob)

    return {
      scraperJob: newJobState,
    }
  }

  @Post('')
  async create(@Body() scraperJobBody: Partial<ScraperJob>) {
    const scraperJob = await this.scraperJobService.create(scraperJobBody)

    return {
      scraperJob,
    }
  }
}
