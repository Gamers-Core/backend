import { MigrationInterface, QueryRunner } from "typeorm";

export class AddressExpantion1786818671911 implements MigrationInterface {
    name = 'AddressExpantion1786818671911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" ADD "secondary_phone_number" text`);
        await queryRunner.query(`ALTER TABLE "address" ADD "is_work_address" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "is_work_address"`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "secondary_phone_number"`);
    }

}
