import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateScraperJob1627822337393 implements MigrationInterface {
  name = "UpdateScraperJob1627822337393";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scraper_job" ADD "lastProcessed" TIMESTAMP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scraper_job" DROP COLUMN "lastProcessed"`
    );
  }
}
