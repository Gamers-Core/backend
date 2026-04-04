import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedProductEntity1775334174123 implements MigrationInterface {
    name = 'AddFeaturedProductEntity1775334174123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('featured_variant');

        if (!hasTable) {
            await queryRunner.query(`
                CREATE TABLE "featured_variant" (
                    "id" SERIAL NOT NULL,
                    "variantId" integer NOT NULL,
                    "title" jsonb NOT NULL,
                    "position" integer NOT NULL,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_featured_variant_id" PRIMARY KEY ("id")
                )
            `);

            await queryRunner.query(`
                ALTER TABLE "featured_variant"
                ADD CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944"
                FOREIGN KEY ("variantId") REFERENCES "product_variant_entity"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION
            `);
        } else {
            const table = await queryRunner.getTable('featured_variant');
            if (!table) return;

            const oldForeignKey = table.foreignKeys.find((fk) => fk.name === 'FK_featured_variant_variantId');
            if (oldForeignKey)
                await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT "FK_featured_variant_variantId"`);

            const hasTitle = await queryRunner.hasColumn('featured_variant', 'title');
            if (!hasTitle) await queryRunner.query(`ALTER TABLE "featured_variant" ADD "title" jsonb NOT NULL`);

            const hasUpdatedAt = await queryRunner.hasColumn('featured_variant', 'updated_at');
            if (!hasUpdatedAt)
                await queryRunner.query(`ALTER TABLE "featured_variant" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);

            const oldUnique = table.uniques.find((unique) => unique.name === 'UQ_91a7d9e04be5da0b1ba8bea3944');
            if (oldUnique)
                await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT "UQ_91a7d9e04be5da0b1ba8bea3944"`);

            const hasNewForeignKey = table.foreignKeys.some((fk) => fk.name === 'FK_91a7d9e04be5da0b1ba8bea3944');
            if (!hasNewForeignKey) {
                await queryRunner.query(`
                    ALTER TABLE "featured_variant"
                    ADD CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944"
                    FOREIGN KEY ("variantId") REFERENCES "product_variant_entity"("id")
                    ON DELETE CASCADE ON UPDATE NO ACTION
                `);
            }
        }

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_featured_variant_position" ON "featured_variant" ("position")`);
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
