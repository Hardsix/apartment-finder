import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScraperJobController } from "./controllers";
import { ScraperJob } from "./entities/scraper-job.entity";
import { ScraperJobService } from "./services/scraper-job.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ScraperJob]),
  ],
  controllers: [ScraperJobController],
  providers: [ScraperJobService]
})
export class ScraperJobModule {}
