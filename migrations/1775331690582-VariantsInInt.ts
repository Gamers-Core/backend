import { MigrationInterface, QueryRunner } from "typeorm";

export class VariantsInInt1775331690582 implements MigrationInterface {
    name = 'VariantsInInt1775331690582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD "price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP COLUMN "cost_per_item"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD "cost_per_item" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP COLUMN "compare_at"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD "compare_at" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP COLUMN "compare_at"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD "compare_at" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP COLUMN "cost_per_item"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD "cost_per_item" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD "price" numeric(10,2) NOT NULL`);
    }

}
