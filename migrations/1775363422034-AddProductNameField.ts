import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductNameField1775363422034 implements MigrationInterface {
    name = 'AddProductNameField1775363422034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "name" jsonb`);
        await queryRunner.query(`UPDATE "product" SET "name" = COALESCE("title", jsonb_build_object('en', '')) WHERE "name" IS NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT IF EXISTS "FK_91a7d9e04be5da0b1ba8bea3944"`);
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT IF EXISTS "UQ_featured_variant_variantId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_featured_variant_variantId" ON "featured_variant" ("variantId")`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_91a7d9e04be5da0b1ba8bea3944'
                      AND conrelid = 'featured_variant'::regclass
                ) THEN
                    ALTER TABLE "featured_variant"
                    ADD CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944"
                    FOREIGN KEY ("variantId") REFERENCES "product_variant_entity"("id")
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT IF EXISTS "FK_91a7d9e04be5da0b1ba8bea3944"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_featured_variant_variantId"`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'UQ_featured_variant_variantId'
                      AND conrelid = 'featured_variant'::regclass
                ) THEN
                    ALTER TABLE "featured_variant"
                    ADD CONSTRAINT "UQ_featured_variant_variantId" UNIQUE ("variantId");
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_91a7d9e04be5da0b1ba8bea3944'
                      AND conrelid = 'featured_variant'::regclass
                ) THEN
                    ALTER TABLE "featured_variant"
                    ADD CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944"
                    FOREIGN KEY ("variantId") REFERENCES "product_variant_entity"("id")
                    ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "name"`);
    }

}
