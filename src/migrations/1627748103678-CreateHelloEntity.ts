import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateHelloEntity1627748103678 implements MigrationInterface {
    name = 'CreateHelloEntity1627748103678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hello" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "meta" json, CONSTRAINT "PK_8a11c3956fec7db6df1a0244e5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_flow_created" ON "hello" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "idx_flow_updated" ON "hello" ("updatedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_flow_updated"`);
        await queryRunner.query(`DROP INDEX "idx_flow_created"`);
        await queryRunner.query(`DROP TABLE "hello"`);
    }

}
