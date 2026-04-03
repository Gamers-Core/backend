import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocalizationToEntities1775136833070 implements MigrationInterface {
    name = 'AddLocalizationToEntities1775136833070'

    private async resolveVariantTableName(queryRunner: QueryRunner): Promise<string | null> {
        if (await queryRunner.hasTable("product_variant")) return "product_variant";
        if (await queryRunner.hasTable("product_variant_entity")) return "product_variant_entity";

        return null;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "UQ_23c05c292c439d77b0de816b500"`);
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "name" TYPE jsonb USING jsonb_build_object('en', "name")`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name")`);

        await queryRunner.query(`ALTER TABLE "brand" DROP CONSTRAINT "UQ_5f468ae5696f07da025138e38f7"`);
        await queryRunner.query(`ALTER TABLE "brand" ALTER COLUMN "name" TYPE jsonb USING jsonb_build_object('en', "name")`);
        await queryRunner.query(`ALTER TABLE "brand" ADD CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE ("name")`);

        const variantTable = await this.resolveVariantTableName(queryRunner);
        if (variantTable)
            await queryRunner.query(`ALTER TABLE "${variantTable}" ALTER COLUMN "name" TYPE jsonb USING CASE WHEN "name" IS NULL THEN NULL ELSE jsonb_build_object('en', "name") END`);

        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "title" TYPE jsonb USING jsonb_build_object('en', COALESCE("title", ''))`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "description" TYPE jsonb USING jsonb_build_object('en', COALESCE("description", ''))`);

        await queryRunner.query(`ALTER TABLE "item_snapshot" ALTER COLUMN "product_title" TYPE jsonb USING jsonb_build_object('en', COALESCE("product_title", ''))`);
        await queryRunner.query(`ALTER TABLE "item_snapshot" ALTER COLUMN "variant_name" TYPE jsonb USING jsonb_build_object('en', COALESCE("variant_name", ''))`);

        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shipping_address" TYPE jsonb USING CASE WHEN "shipping_address" IS NULL OR btrim("shipping_address") = '' THEN '{}'::jsonb ELSE "shipping_address"::jsonb END`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shipping_address" TYPE text USING COALESCE("shipping_address"::text, '{}')`);

        await queryRunner.query(`ALTER TABLE "item_snapshot" ALTER COLUMN "variant_name" TYPE character varying(255) USING COALESCE("variant_name"->>'en', '')`);
        await queryRunner.query(`ALTER TABLE "item_snapshot" ALTER COLUMN "product_title" TYPE character varying(255) USING COALESCE("product_title"->>'en', '')`);

        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "description" TYPE text USING COALESCE("description"->>'en', '')`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "title" TYPE character varying USING COALESCE("title"->>'en', '')`);

        const variantTable = await this.resolveVariantTableName(queryRunner);
        if (variantTable)
            await queryRunner.query(`ALTER TABLE "${variantTable}" ALTER COLUMN "name" TYPE character varying(255) USING "name"->>'en'`);

        await queryRunner.query(`ALTER TABLE "brand" DROP CONSTRAINT "UQ_5f468ae5696f07da025138e38f7"`);
        await queryRunner.query(`ALTER TABLE "brand" ALTER COLUMN "name" TYPE character varying USING COALESCE("name"->>'en', '')`);
        await queryRunner.query(`ALTER TABLE "brand" ADD CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE ("name")`);

        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "UQ_23c05c292c439d77b0de816b500"`);
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "name" TYPE character varying USING COALESCE("name"->>'en', '')`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name")`);
    }

}
