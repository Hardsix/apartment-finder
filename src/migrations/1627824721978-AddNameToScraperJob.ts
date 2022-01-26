import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToScraperJob1627824721978 implements MigrationInterface {
  name = "AddNameToScraperJob1627824721978";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scraper_job" ADD "name" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scraper_job" DROP COLUMN "name"`);
  }
}
