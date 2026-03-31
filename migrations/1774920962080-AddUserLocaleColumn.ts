import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLocaleColumn1774920962080 implements MigrationInterface {
    name = 'AddUserLocaleColumn1774920962080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "locale" character varying NOT NULL DEFAULT 'en'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "locale"`);
    }

}
