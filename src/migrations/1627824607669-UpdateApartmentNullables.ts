import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateApartmentNullables1627824607669 implements MigrationInterface {
    name = 'UpdateApartmentNullables1627824607669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apartment" ALTER COLUMN "floor" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "apartment"."floor" IS NULL`);
        await queryRunner.query(`ALTER TABLE "apartment" ALTER COLUMN "yearBuilt" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "apartment"."yearBuilt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "apartment" ALTER COLUMN "yearRenovated" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "apartment"."yearRenovated" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "apartment"."yearRenovated" IS NULL`);
        await queryRunner.query(`ALTER TABLE "apartment" ALTER COLUMN "yearRenovated" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "apartment"."yearBuilt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "apartment" ALTER COLUMN "yearBuilt" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "apartment"."floor" IS NULL`);
        await queryRunner.query(`ALTER TABLE "apartment" ALTER COLUMN "floor" SET NOT NULL`);
    }

}
