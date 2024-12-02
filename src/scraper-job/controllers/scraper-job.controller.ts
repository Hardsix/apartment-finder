import * as _ from "lodash";
import * as bluebird from "bluebird";
import PQueue from "p-queue";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ScraperJob } from "../entities/scraper-job.entity";
import { ScraperJobService } from "../services/scraper-job.service";
import { ApartmentService } from "~/apartment/services/apartment.service";
import { Cron } from "@nestjs/schedule";
import { ScraperService } from "../services/scraper.service";

const MY_SLACK_WEBHOOK_URL =
  "https://hooks.slack.com/services/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"; //'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken';
const slack = require("slack-notify")(MY_SLACK_WEBHOOK_URL);

const jobQueue = new PQueue({ concurrency: 1 });

// async function sleep (ms) {
//   return new Promise((resolve, reject) => {
//     setTimeout(resolve, ms)
//   })
// }

// async function fun (repo) {
//   await sleep(5000)
//   await repo.findExistingApartment({ url: 'tomin url' })
// }

@Controller("scraperJob")
export class ScraperJobController {
  constructor(
    private readonly scraperJobRepo: ScraperJobService,
    private readonly apartmentRepo: ApartmentService,
    private readonly scraperService: ScraperService
  ) {
    // fun(apartmentRepo)
  }

  @Get("/:scraperJobId")
  async get(@Param("scraperJobId") scraperJobId: string): Promise<ScraperJob> {
    const scraperJob = await this.scraperJobRepo.findOne(scraperJobId);
    return scraperJob;
  }

  @Delete("/:scraperJobId")
  async delete(@Param("scraperJobId") scraperJobId: string): Promise<void> {
    const scraperJob = await this.scraperJobRepo.findOne(scraperJobId);
    await this.scraperJobRepo.delete(scraperJob);
  }

  @Get("/")
  async getAll(): Promise<ScraperJob[]> {
    const scraperJobs = await this.scraperJobRepo.find({});
    return scraperJobs;
  }

  async processScraperJob(scraperJob: ScraperJob) {
    const apartmentsData = await this.scraperService.scrapeApartments(
      scraperJob.name,
      scraperJob.url,
      scraperJob.lastProcessed,
      scraperJob.type || "njuskalo"
    );

    const newApartments = [];
    await bluebird.mapSeries(apartmentsData, async (item) => {
      try {
        const {
          apartment,
          isNewEntity,
        } = await this.apartmentRepo.saveWithSoftEqual({
          ...item.data,
          url: item.link,
        });
        if (isNewEntity) {
          newApartments.push(apartment);
        }
      } catch (err) {
        console.log(
          `[${scraperJob.name
          } - ${new Date()}] - error saving apartment:\n${JSON.stringify(
            {
              ...item.data,
              url: item.link,
            },
            null,
            2
          )}`
        );
      }
    });

    if (_.size(newApartments) > 0 && process.env.SEND_SLACK_NOTIFICATIONS === 'true') {
      slack.send({
        text: `New apartments - ${scraperJob.name}:\n${_.join(
          _.map(newApartments, (apt) => apt.url),
          "\n"
        )}`,
        unfurl_links: 1,
      });
    }

    const newJobState = await this.scraperJobRepo.update(scraperJob.id, {
      lastProcessed: new Date(),
    });
    return newJobState;
  }

  @Cron("27 * * * *")
  async handleCron() {
    console.log("Queuing scraper jobs...");
    const jobs = await this.scraperJobRepo.getAll();
    console.log(`Located ${jobs.length} to execute`);
    await bluebird.mapSeries(jobs, async (job) => {
      console.log(`Executing job ${job.name}`);
      await jobQueue.add(async () => {
        try {
          await this.processScraperJob(job);
          console.log(`Finished executing job ${job.name}`);
        } catch (err) {
          console.log(
            `Error executing job ${job.name}:\n${JSON.stringify(err, null, 2)}`
          );
        }
      });
    });
  }

  @Post("/:scraperJobId/process")
  async manuallyProcessScraperJob(@Param("scraperJobId") scraperJobId: string) {
    const scraperJob = await this.scraperJobRepo.findOne(scraperJobId);

    const newJobState = await this.processScraperJob(scraperJob);

    return {
      scraperJob: newJobState,
    };
  }

  @Post("")
  async create(@Body() scraperJobBody: Partial<ScraperJob>) {
    const scraperJob = await this.scraperJobRepo.create(scraperJobBody);

    return {
      scraperJob,
    };
  }
}
