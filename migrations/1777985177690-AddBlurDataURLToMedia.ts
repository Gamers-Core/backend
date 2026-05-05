import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlurDataURLToMedia1777985177690 implements MigrationInterface {
    name = 'AddBlurDataURLToMedia1777985177690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" ADD "blur_data_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "blur_data_url"`);
    }

}
