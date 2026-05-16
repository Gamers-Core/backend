import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPositionToVariants1780000000000 implements MigrationInterface {
    name = 'AddPositionToVariants1780000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD "position" integer`);
        await queryRunner.query(`
            UPDATE "product_variant_entity" pv
            SET "position" = ranked.row_num
            FROM (
                SELECT "id", ROW_NUMBER() OVER (PARTITION BY "product_id" ORDER BY "id") AS row_num
                FROM "product_variant_entity"
            ) ranked
            WHERE pv."id" = ranked."id"
        `);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ALTER COLUMN "position" SET NOT NULL`);
        await queryRunner.query(
            `CREATE INDEX "idx_variant_product_position" ON "product_variant_entity" ("product_id", "position")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_variant_product_position"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP COLUMN "position"`);
    }
}
