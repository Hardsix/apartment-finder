import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriorityToScraperJob1627829575420
  implements MigrationInterface {
  name = "AddPriorityToScraperJob1627829575420";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scraper_job" ADD "priority" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scraper_job" DROP COLUMN "priority"`);
  }
}
