import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnitCostToOrderSnapshot1780719057538 implements MigrationInterface {
    name = 'AddUnitCostToOrderSnapshot1780719057538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_snapshot" ADD "unit_cost" numeric(10,2)`);
        await queryRunner.query(`UPDATE "item_snapshot" SET "unit_cost" = 0 WHERE "unit_cost" IS NULL`);
        await queryRunner.query(`ALTER TABLE "item_snapshot" ALTER COLUMN "unit_cost" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_snapshot" DROP COLUMN "unit_cost"`);
    }

}
