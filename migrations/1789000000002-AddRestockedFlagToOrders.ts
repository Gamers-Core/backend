import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRestockedFlagToOrders1789000000002 implements MigrationInterface {
    name = 'AddRestockedFlagToOrders1789000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD COLUMN "restocked" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "restocked"`);
    }
}
