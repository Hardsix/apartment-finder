import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateScraperJob1627822419887 implements MigrationInterface {
  name = "UpdateScraperJob1627822419887";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scraper_job" ALTER COLUMN "lastProcessed" DROP NOT NULL`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "scraper_job"."lastProcessed" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "scraper_job"."lastProcessed" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "scraper_job" ALTER COLUMN "lastProcessed" SET NOT NULL`
    );
  }
}
