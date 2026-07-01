import { MigrationInterface, QueryRunner } from "typeorm";

export class SeparateShippingFees1782637430496 implements MigrationInterface {
    name = 'SeparateShippingFees1782637430496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "cod_fee" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "open_package_fee" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "is_free_shipping" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "discount_amount" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "open_package_fee"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cod_fee"`);
         await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "discount_amount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "is_free_shipping"`);
    }

}
