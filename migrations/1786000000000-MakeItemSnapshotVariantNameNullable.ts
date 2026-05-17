import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeItemSnapshotVariantNameNullable1786000000000 implements MigrationInterface {
    name = 'MakeItemSnapshotVariantNameNullable1786000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_snapshot" ALTER COLUMN "variant_name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_snapshot" ALTER COLUMN "variant_name" SET NOT NULL`);
    }

}
