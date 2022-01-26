import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeSquareMetersFloat1627829175422 implements MigrationInterface {
  name = "MakeSquareMetersFloat1627829175422";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "apartment" DROP COLUMN "squareMeters"`
    );
    await queryRunner.query(
      `ALTER TABLE "apartment" ADD "squareMeters" double precision NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "apartment" DROP COLUMN "squareMeters"`
    );
    await queryRunner.query(
      `ALTER TABLE "apartment" ADD "squareMeters" integer NOT NULL`
    );
  }
}
