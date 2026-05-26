/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentStatusesToOrderHistoryEnum1789000000001 implements MigrationInterface {
    name = 'AddPaymentStatusesToOrderHistoryEnum1789000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "order_status_history_status_enum" ADD VALUE IF NOT EXISTS 'unpaid'`);
        await queryRunner.query(`ALTER TYPE "order_status_history_status_enum" ADD VALUE IF NOT EXISTS 'paid'`);
        await queryRunner.query(`ALTER TYPE "order_status_history_status_enum" ADD VALUE IF NOT EXISTS 'refunded'`);
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // No safe down migration for removing enum values in PostgreSQL.
    }
}
