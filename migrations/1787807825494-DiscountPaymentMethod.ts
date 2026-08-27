import { MigrationInterface, QueryRunner } from "typeorm";

export class DiscountPaymentMethod1787807825494 implements MigrationInterface {
    name = 'DiscountPaymentMethod1787807825494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."discount_payment_methods_enum" AS ENUM('instapay', 'cod', 'valu', 'card')`);
        await queryRunner.query(`ALTER TABLE "discount" ADD "payment_methods" "public"."discount_payment_methods_enum" array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discount" DROP COLUMN "payment_methods"`);
        await queryRunner.query(`DROP TYPE "public"."discount_payment_methods_enum"`);
    }

}
