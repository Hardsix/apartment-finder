import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateApartment1627819917664 implements MigrationInterface {
    name = 'UpdateApartment1627819917664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apartment" ADD "yearBuilt" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "apartment" ADD "yearRenovated" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apartment" DROP COLUMN "yearRenovated"`);
        await queryRunner.query(`ALTER TABLE "apartment" DROP COLUMN "yearBuilt"`);
    }

}
