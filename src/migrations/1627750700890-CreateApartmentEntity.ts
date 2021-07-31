import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateApartmentEntity1627750700890 implements MigrationInterface {
    name = 'CreateApartmentEntity1627750700890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "apartment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "squareMeters" integer NOT NULL, "priceEuros" integer NOT NULL, "bedroomCount" integer, "hasParking" boolean, "hasGarage" boolean, "description" character varying, "city" character varying, "neighbourhood" character varying, "locationInNeighbourhood" character varying, "advertisementCode" character varying NOT NULL, "floor" integer NOT NULL, "meta" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c3d874d9924f6f16223162b3d3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_apartment_url" ON "apartment" ("url") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_apartment_advertisementCode" ON "apartment" ("advertisementCode") `);
        await queryRunner.query(`CREATE INDEX "idx_apartment_created" ON "apartment" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "idx_apartment_updated" ON "apartment" ("updatedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_apartment_updated"`);
        await queryRunner.query(`DROP INDEX "idx_apartment_created"`);
        await queryRunner.query(`DROP INDEX "idx_apartment_advertisementCode"`);
        await queryRunner.query(`DROP INDEX "idx_apartment_url"`);
        await queryRunner.query(`DROP TABLE "apartment"`);
    }

}
