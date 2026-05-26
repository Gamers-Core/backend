import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderHistoryTypeAndPaymentStatus1789000000000 implements MigrationInterface {
    name = 'AddOrderHistoryTypeAndPaymentStatus1789000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.query(`DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_history_type_enum') THEN
        CREATE TYPE "order_status_history_type_enum" AS ENUM ('status', 'payment_status');
    END IF;
END$$;`);
                await queryRunner.query(`ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "type" "order_status_history_type_enum"`);
                await queryRunner.query(`DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_history_status_enum') THEN
        CREATE TYPE "order_status_history_status_enum" AS ENUM ('pending','confirmed','on-hold','on-progress','shipped','delivered','completed','returned','cancelled','unpaid','paid','refunded');
    END IF;
END$$;`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" TYPE "order_status_history_status_enum" USING "status"::text::"order_status_history_status_enum"`);
        await queryRunner.query(`UPDATE "order_status_history" SET "type" = 'status' WHERE "type" IS NULL`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" TYPE "order_status_enum" USING "status"::text::"order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "order_status_history_status_enum"`);
        await queryRunner.query(`DROP TYPE "order_status_history_type_enum"`);
    }
}
