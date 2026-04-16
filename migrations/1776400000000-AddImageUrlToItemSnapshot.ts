import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToItemSnapshot1776400000000 implements MigrationInterface {
    name = 'AddImageUrlToItemSnapshot1776400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_snapshot" ADD "image_url" character varying(2048)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_snapshot" DROP COLUMN "image_url"`);
    }

}
