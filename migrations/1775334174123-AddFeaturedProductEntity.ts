import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedProductEntity1775334174123 implements MigrationInterface {
    name = 'AddFeaturedProductEntity1775334174123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT "FK_featured_variant_variantId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_featured_variant_position"`);
        await queryRunner.query(`ALTER TABLE "featured_variant" ADD "title" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "featured_variant" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT "UQ_91a7d9e04be5da0b1ba8bea3944"`);
        await queryRunner.query(`ALTER TABLE "featured_variant" ADD CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944" FOREIGN KEY ("variantId") REFERENCES "product_variant_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944"`);
        await queryRunner.query(`ALTER TABLE "featured_variant" ADD CONSTRAINT "UQ_91a7d9e04be5da0b1ba8bea3944" UNIQUE ("variantId")`);
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP COLUMN "title"`);
        await queryRunner.query(`CREATE INDEX "IDX_featured_variant_position" ON "featured_variant" ("position") `);
        await queryRunner.query(`ALTER TABLE "featured_variant" ADD CONSTRAINT "FK_featured_variant_variantId" FOREIGN KEY ("variantId") REFERENCES "product_variant_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
