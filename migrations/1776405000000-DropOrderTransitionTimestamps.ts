import { MigrationInterface, QueryRunner } from "typeorm";

export class DropOrderTransitionTimestamps1776405000000 implements MigrationInterface {
    name = 'DropOrderTransitionTimestamps1776405000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_status_history_status_enum" AS ENUM('pending', 'confirmed', 'on-hold', 'on-progress', 'shipped', 'delivered', 'completed', 'returned', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "order_status_history" ("id" SERIAL NOT NULL, "status" "public"."order_status_history_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "order_id" integer NOT NULL, CONSTRAINT "PK_8737cf38a8d489c5352287efb79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_order_status_history_order_id_created_at" ON "order_status_history" ("order_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_71191894750adf3578d4f8def5a" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "paid_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "confirmed_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "on_hold_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "on_progress_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "shipped_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "delivered_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "completed_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "returned_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "cancelled_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "canceled_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "refunded_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "paid_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "confirmed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "on_hold_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "on_progress_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "shipped_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "delivered_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "completed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "returned_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "canceled_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "refunded_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_71191894750adf3578d4f8def5a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_order_status_history_order_id_created_at"`);
        await queryRunner.query(`DROP TABLE "order_status_history"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_history_status_enum"`);
    }

}
