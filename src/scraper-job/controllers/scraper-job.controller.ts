import * as _ from 'lodash'
import * as bluebird from 'bluebird'
import PQueue from 'p-queue';
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ScraperJob } from "../entities/scraper-job.entity";
import { ScraperJobService } from "../services/scraper-job.service";
import { extractApartmentsDataFromNjuskaloPage } from '../services/scraper.service';
import { ApartmentService } from '~/apartment/services/apartment.service';
import { Cron } from '@nestjs/schedule';

const jobQueue = new PQueue({ concurrency: 1 });

@Controller("scraperJob")
export class ScraperJobController {
  constructor(private readonly scraperJobService: ScraperJobService, private readonly apartmentService: ApartmentService) {}

  @Get('/:scraperJobId')
  async get(@Param('scraperJobId') scraperJobId: string): Promise<ScraperJob> {
    const scraperJob = await this.scraperJobService.findOne(scraperJobId)
    return scraperJob
  }

  @Delete('/:scraperJobId')
  async delete(@Param('scraperJobId') scraperJobId: string): Promise<void> {
    const scraperJob = await this.scraperJobService.findOne(scraperJobId)
    await this.scraperJobService.delete(scraperJob)
  }

  @Get('/')
  async getAll(): Promise<ScraperJob[]> {
    const scraperJobs = await this.scraperJobService.find({})
    return scraperJobs
  }

  async processScraperJob(scraperJob: ScraperJob) {
    const data = await extractApartmentsDataFromNjuskaloPage(scraperJob.name, scraperJob.url, scraperJob.lastProcessed)
    await bluebird.mapSeries(data, async (item) => {
      try {
        await this.apartmentService.saveWithSoftEqual({
          ...item.data,
          url: item.link,
        })
      } catch (err) {
        console.log(`[${scraperJob.name} - ${new Date()}] - error saving apartment:\n${JSON.stringify({
          ...item.data,
          url: item.link,
        }, null, 2)}`)
      }
    })

    const newJobState = await this.scraperJobService.update(scraperJob.id, { lastProcessed: new Date() })
    return newJobState
  }

  @Cron('*/15 * * * *')
  async handleCron() {
    console.log('Queuing scraper jobs...');
    const jobs = await this.scraperJobService.getAll()
    console.log(`Located ${jobs.length} to execute`);
    await bluebird.mapSeries(jobs, async (job) => {
      console.log(`Executing job ${job.name}`);
      await jobQueue.add(async () => {
        try {
          await this.processScraperJob(job)
          console.log(`Finished executing job ${job.name}`);
        } catch (err) {
          console.log(`Error executing job ${job.name}:\n${JSON.stringify(err, null, 2)}`);
        }
      })
    })
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
