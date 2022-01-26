import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApartmentModule } from "~/apartment/apartment.module";
import { ScraperJobController } from "./controllers";
import { ScraperJob } from "./entities/scraper-job.entity";
import { ScraperJobService } from "./services/scraper-job.service";
import { ScraperService } from "./services/scraper.service";
import { IndexScraperService } from "./services/scrapers";

@Module({
  imports: [TypeOrmModule.forFeature([ScraperJob]), ApartmentModule],
  controllers: [ScraperJobController],
  providers: [ScraperJobService, ScraperService, IndexScraperService],
})
export class ScraperJobModule {}
