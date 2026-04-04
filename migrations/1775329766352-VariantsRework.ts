import { MigrationInterface, QueryRunner } from 'typeorm';

export class VariantsRework1775329766352 implements MigrationInterface {
    name = 'VariantsRework1775329766352';

    private async resolveVariantTableName(queryRunner: QueryRunner): Promise<string | null> {
        if (await queryRunner.hasTable('product_variant_entity')) return 'product_variant_entity';
        if (await queryRunner.hasTable('product_variant')) return 'product_variant';

        return null;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        const variantTable = await this.resolveVariantTableName(queryRunner);
        if (!variantTable) return;

        if (await queryRunner.hasColumn(variantTable, 'is_default'))
            await queryRunner.query(`ALTER TABLE "${variantTable}" DROP COLUMN "is_default"`);

        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT IF EXISTS "UQ_23c05c292c439d77b0de816b500"`);
        await queryRunner.query(`ALTER TABLE "brand" DROP CONSTRAINT IF EXISTS "UQ_5f468ae5696f07da025138e38f7"`);

        if (await queryRunner.hasColumn(variantTable, 'price')) {
            await queryRunner.query(
                `ALTER TABLE "${variantTable}" ALTER COLUMN "price" TYPE numeric(10,2) USING "price"::numeric(10,2)`,
            );
            await queryRunner.query(`ALTER TABLE "${variantTable}" ALTER COLUMN "price" SET NOT NULL`);
    }

        if (await queryRunner.hasColumn(variantTable, 'cost_per_item')) {
            await queryRunner.query(
                `ALTER TABLE "${variantTable}" ALTER COLUMN "cost_per_item" TYPE numeric(10,2) USING "cost_per_item"::numeric(10,2)`,
            );
            await queryRunner.query(`ALTER TABLE "${variantTable}" ALTER COLUMN "cost_per_item" SET NOT NULL`);
        }

        if (await queryRunner.hasColumn(variantTable, 'compare_at'))
            await queryRunner.query(
                `ALTER TABLE "${variantTable}" ALTER COLUMN "compare_at" TYPE numeric(10,2) USING "compare_at"::numeric(10,2)`,
            );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const variantTable = await this.resolveVariantTableName(queryRunner);
        if (!variantTable) return;

        if (await queryRunner.hasColumn(variantTable, 'compare_at'))
            await queryRunner.query(
                `ALTER TABLE "${variantTable}" ALTER COLUMN "compare_at" TYPE integer USING CASE WHEN "compare_at" IS NULL THEN NULL ELSE ROUND("compare_at")::integer END`,
            );

        if (await queryRunner.hasColumn(variantTable, 'cost_per_item')) {
            await queryRunner.query(
                `ALTER TABLE "${variantTable}" ALTER COLUMN "cost_per_item" TYPE integer USING ROUND("cost_per_item")::integer`,
            );
            await queryRunner.query(`ALTER TABLE "${variantTable}" ALTER COLUMN "cost_per_item" SET NOT NULL`);
        }

        if (await queryRunner.hasColumn(variantTable, 'price')) {
            await queryRunner.query(
                `ALTER TABLE "${variantTable}" ALTER COLUMN "price" TYPE integer USING ROUND("price")::integer`,
            );
            await queryRunner.query(`ALTER TABLE "${variantTable}" ALTER COLUMN "price" SET NOT NULL`);
        }

        await queryRunner.query(`ALTER TABLE "brand" ADD CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name")`);

        if (!(await queryRunner.hasColumn(variantTable, 'is_default')))
            await queryRunner.query(`ALTER TABLE "${variantTable}" ADD "is_default" boolean NOT NULL DEFAULT false`);
    }
}
