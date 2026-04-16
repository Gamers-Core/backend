import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressDropoffCity1776310078738 implements MigrationInterface {
    name = 'AddAddressDropoffCity1776310078738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" ADD "city_drop_off" character varying`);
        await queryRunner.query(`UPDATE "address" SET "city_drop_off" = COALESCE("city_name", '') WHERE "city_drop_off" IS NULL`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "city_drop_off" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "city_drop_off"`);
    }

}
