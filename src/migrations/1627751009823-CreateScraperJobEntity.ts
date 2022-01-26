import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateScraperJobEntity1627751009823 implements MigrationInterface {
  name = "CreateScraperJobEntity1627751009823";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scraper_job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_16a32b457b57c43e397d73b6b1c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_scraperJob_created" ON "scraper_job" ("createdAt") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_scraperJob_updated" ON "scraper_job" ("updatedAt") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_scraperJob_updated"`);
    await queryRunner.query(`DROP INDEX "idx_scraperJob_created"`);
    await queryRunner.query(`DROP TABLE "scraper_job"`);
  }
}
