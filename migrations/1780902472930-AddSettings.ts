import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettings1780902472930 implements MigrationInterface {
    name = 'AddSettings1780902472930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "setting" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "value" jsonb NOT NULL, CONSTRAINT "UQ_1c4c95d773004250c157a744d6e" UNIQUE ("key"), CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "setting"`);
    }
}
