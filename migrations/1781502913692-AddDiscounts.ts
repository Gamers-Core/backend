import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscounts1781502913692 implements MigrationInterface {
  name = 'AddDiscounts1781502913692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Replace variant ordering index
    await queryRunner.query(`DROP INDEX "public"."idx_variant_product_position"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_variant_product_position" ON "product_variant_entity" ("product_id", "position")`,
    );

    // Enums
    await queryRunner.query(
      `CREATE TYPE "public"."discount_method_enum" AS ENUM ('code', 'automatic')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."discount_target_enum" AS ENUM ('product', 'order', 'category', 'brand', 'free_shipping')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."discount_value_type_enum" AS ENUM ('percentage', 'fixed_amount')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."discount_eligibility_enum" AS ENUM ('all_users', 'custom_users')`,
    );

    // Discount
    await queryRunner.query(`
      CREATE TABLE "discount" (
        "id" SERIAL NOT NULL,
        "code" character varying,
        "method" "public"."discount_method_enum" NOT NULL,
        "target" "public"."discount_target_enum" NOT NULL,
        "value_type" "public"."discount_value_type_enum",
        "value" numeric(10,2),
        "eligibility" "public"."discount_eligibility_enum" NOT NULL DEFAULT 'all_users',
        "min_order_amount" numeric(10,2),
        "max_discount_amount" numeric(10,2),
        "usage_limit" integer,
        "usage_count" integer NOT NULL DEFAULT 0,
        "usage_limit_per_user" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "starts_at" TIMESTAMP,
        "expires_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discount" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_discount_code"
      ON "discount" ("code")
      WHERE "code" IS NOT NULL
    `);

    // Discount usage
    await queryRunner.query(`
      CREATE TABLE "discount_usage" (
        "id" SERIAL NOT NULL,
        "discount_amount" numeric(10,2),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "discount_id" integer,
        "user_id" integer,
        "order_id" integer,
        CONSTRAINT "PK_discount_usage" PRIMARY KEY ("id")
      )
    `);

    // Discount -> Variants
    await queryRunner.query(`
      CREATE TABLE "discount_variants_product_variant_entity" (
        "discount_id" integer NOT NULL,
        "product_variant_entity_id" integer NOT NULL,
        CONSTRAINT "PK_discount_variants"
        PRIMARY KEY ("discount_id", "product_variant_entity_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_variants_discount"
      ON "discount_variants_product_variant_entity" ("discount_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_variants_variant"
      ON "discount_variants_product_variant_entity" ("product_variant_entity_id")
    `);

    // Discount -> Categories
    await queryRunner.query(`
      CREATE TABLE "discount_categories_category" (
        "discount_id" integer NOT NULL,
        "category_id" integer NOT NULL,
        CONSTRAINT "PK_discount_categories"
        PRIMARY KEY ("discount_id", "category_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_categories_discount"
      ON "discount_categories_category" ("discount_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_categories_category"
      ON "discount_categories_category" ("category_id")
    `);

    // Discount -> Brands
    await queryRunner.query(`
      CREATE TABLE "discount_brands_brand" (
        "discount_id" integer NOT NULL,
        "brand_id" integer NOT NULL,
        CONSTRAINT "PK_discount_brands"
        PRIMARY KEY ("discount_id", "brand_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_brands_discount"
      ON "discount_brands_brand" ("discount_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_brands_brand"
      ON "discount_brands_brand" ("brand_id")
    `);

    // Discount -> Eligible users
    await queryRunner.query(`
      CREATE TABLE "discount_eligible_users_user" (
        "discount_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        CONSTRAINT "PK_discount_eligible_users"
        PRIMARY KEY ("discount_id", "user_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_users_discount"
      ON "discount_eligible_users_user" ("discount_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_discount_users_user"
      ON "discount_eligible_users_user" ("user_id")
    `);

    // Order additions
    await queryRunner.query(
      `ALTER TABLE "order" ADD "discount_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "discount_amount" numeric(10,2) DEFAULT '0'`,
    );

    // Discount usage FKs
    await queryRunner.query(`
      ALTER TABLE "discount_usage"
      ADD CONSTRAINT "FK_discount_usage_discount"
      FOREIGN KEY ("discount_id")
      REFERENCES "discount"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "discount_usage"
      ADD CONSTRAINT "FK_discount_usage_user"
      FOREIGN KEY ("user_id")
      REFERENCES "user"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "discount_usage"
      ADD CONSTRAINT "FK_discount_usage_order"
      FOREIGN KEY ("order_id")
      REFERENCES "order"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    // Variant relation FKs
    await queryRunner.query(`
      ALTER TABLE "discount_variants_product_variant_entity"
      ADD CONSTRAINT "FK_discount_variants_discount"
      FOREIGN KEY ("discount_id")
      REFERENCES "discount"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "discount_variants_product_variant_entity"
      ADD CONSTRAINT "FK_discount_variants_variant"
      FOREIGN KEY ("product_variant_entity_id")
      REFERENCES "product_variant_entity"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    // Category relation FKs
    await queryRunner.query(`
      ALTER TABLE "discount_categories_category"
      ADD CONSTRAINT "FK_discount_categories_discount"
      FOREIGN KEY ("discount_id")
      REFERENCES "discount"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "discount_categories_category"
      ADD CONSTRAINT "FK_discount_categories_category"
      FOREIGN KEY ("category_id")
      REFERENCES "category"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    // Brand relation FKs
    await queryRunner.query(`
      ALTER TABLE "discount_brands_brand"
      ADD CONSTRAINT "FK_discount_brands_discount"
      FOREIGN KEY ("discount_id")
      REFERENCES "discount"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "discount_brands_brand"
      ADD CONSTRAINT "FK_discount_brands_brand"
      FOREIGN KEY ("brand_id")
      REFERENCES "brand"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    // Eligible users relation FKs
    await queryRunner.query(`
      ALTER TABLE "discount_eligible_users_user"
      ADD CONSTRAINT "FK_discount_users_discount"
      FOREIGN KEY ("discount_id")
      REFERENCES "discount"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "discount_eligible_users_user"
      ADD CONSTRAINT "FK_discount_users_user"
      FOREIGN KEY ("user_id")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "discount_eligible_users_user" DROP CONSTRAINT "FK_discount_users_user"`);
    await queryRunner.query(`ALTER TABLE "discount_eligible_users_user" DROP CONSTRAINT "FK_discount_users_discount"`);

    await queryRunner.query(`ALTER TABLE "discount_brands_brand" DROP CONSTRAINT "FK_discount_brands_brand"`);
    await queryRunner.query(`ALTER TABLE "discount_brands_brand" DROP CONSTRAINT "FK_discount_brands_discount"`);

    await queryRunner.query(`ALTER TABLE "discount_categories_category" DROP CONSTRAINT "FK_discount_categories_category"`);
    await queryRunner.query(`ALTER TABLE "discount_categories_category" DROP CONSTRAINT "FK_discount_categories_discount"`);

    await queryRunner.query(`ALTER TABLE "discount_variants_product_variant_entity" DROP CONSTRAINT "FK_discount_variants_variant"`);
    await queryRunner.query(`ALTER TABLE "discount_variants_product_variant_entity" DROP CONSTRAINT "FK_discount_variants_discount"`);

    await queryRunner.query(`ALTER TABLE "discount_usage" DROP CONSTRAINT "FK_discount_usage_order"`);
    await queryRunner.query(`ALTER TABLE "discount_usage" DROP CONSTRAINT "FK_discount_usage_user"`);
    await queryRunner.query(`ALTER TABLE "discount_usage" DROP CONSTRAINT "FK_discount_usage_discount"`);

    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "discount_amount"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "discount_code"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_discount_users_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_discount_users_discount"`);
    await queryRunner.query(`DROP TABLE "discount_eligible_users_user"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_discount_brands_brand"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_discount_brands_discount"`);
    await queryRunner.query(`DROP TABLE "discount_brands_brand"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_discount_categories_category"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_discount_categories_discount"`);
    await queryRunner.query(`DROP TABLE "discount_categories_category"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_discount_variants_variant"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_discount_variants_discount"`);
    await queryRunner.query(`DROP TABLE "discount_variants_product_variant_entity"`);

    await queryRunner.query(`DROP TABLE "discount_usage"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_discount_code"`);
    await queryRunner.query(`DROP TABLE "discount"`);

    await queryRunner.query(`DROP TYPE "public"."discount_eligibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."discount_value_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."discount_target_enum"`);
    await queryRunner.query(`DROP TYPE "public"."discount_method_enum"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_variant_product_position"`);
    await queryRunner.query(
      `CREATE INDEX "idx_variant_product_position" ON "product_variant_entity" ("position", "product_id")`,
    );
  }
}