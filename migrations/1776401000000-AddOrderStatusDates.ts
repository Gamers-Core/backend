import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusDates1776401000000 implements MigrationInterface {
    name = 'AddOrderStatusDates1776401000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "confirmed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "shipped_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "delivered_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "completed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "returned_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "canceled_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "refunded_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "refunded_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "canceled_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "returned_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "completed_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "delivered_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shipped_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "confirmed_at"`);
    }

}
