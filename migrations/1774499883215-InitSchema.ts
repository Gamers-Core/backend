import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1774499883215 implements MigrationInterface {
    name = 'InitSchema1774499883215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "phone_number" character varying NOT NULL, "detailed_address" text NOT NULL, "district_id" character varying NOT NULL, "district_name" character varying NOT NULL, "city_id" character varying NOT NULL, "city_name" character varying NOT NULL, "name_ar" character varying NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_address_user_default" ON "address" ("user_id") WHERE is_default = true`);
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brand" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE ("name"), CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_variant_entity" ("id" SERIAL NOT NULL, "external_id" character varying(36) NOT NULL, "name" character varying(255), "is_default" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "stock" integer NOT NULL, "price" integer NOT NULL, "cost_per_item" integer NOT NULL, "compare_at" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "product_id" integer NOT NULL, CONSTRAINT "UQ_9f380aaa29ca501db9b2c2e4f46" UNIQUE ("external_id"), CONSTRAINT "CHK_variant_compareAt_gt_price" CHECK ("compare_at" IS NULL OR "compare_at" > "price"), CONSTRAINT "PK_7deac490766ad101c67289afc34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_status_enum" AS ENUM('active', 'draft', 'unlisted')`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "status" "public"."product_status_enum" NOT NULL DEFAULT 'unlisted', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "brandId" integer, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "cart_id" integer NOT NULL, "variant_id" integer NOT NULL, CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_cart_item_variant" ON "cart_item" ("cart_id", "variant_id") `);
        await queryRunner.query(`CREATE TABLE "cart" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "REL_f091e86a234693a49084b4c2c8" UNIQUE ("user_id"), CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_cart_user" ON "cart" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "item_snapshot" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "product_title" character varying(255) NOT NULL, "variant_external_id" character varying(36) NOT NULL, "variant_name" character varying(255) NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "line_total" numeric(10,2) NOT NULL, "order_id" integer NOT NULL, CONSTRAINT "PK_6c56d4642fcc92bcdcdc640e571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'confirmed', 'on-hold', 'on-progress', 'shipped', 'delivered', 'completed', 'returned', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."order_payment_status_enum" AS ENUM('unpaid', 'paid', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."order_payment_method_enum" AS ENUM('cod', 'instapay', 'valu', 'card')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "order_number" character varying NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending', "payment_status" "public"."order_payment_status_enum" NOT NULL DEFAULT 'unpaid', "payment_method" "public"."order_payment_method_enum" NOT NULL DEFAULT 'cod', "shipping_address" text NOT NULL, "note" text, "tracking_number" character varying(255), "can_open_package" boolean NOT NULL DEFAULT false, "subtotal" numeric(10,2) NOT NULL, "shipping_fee" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'EGP', "paid_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "UQ_f9180f384353c621e8d0c414c14" UNIQUE ("order_number"), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "is_admin" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."media_type_enum" AS ENUM('auto', 'image', 'video', 'raw')`);
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "public_id" character varying NOT NULL, "type" "public"."media_type_enum" NOT NULL DEFAULT 'auto', "width" integer NOT NULL, "height" integer NOT NULL, "format" character varying NOT NULL, "bytes" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP, CONSTRAINT "UQ_f1a0bdbaefaee954f099ccbd035" UNIQUE ("public_id"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_media_is_deleted_expires_at" ON "media" ("is_deleted", "expires_at") `);
        await queryRunner.query(`CREATE TYPE "public"."media_attachment_entity_type_enum" AS ENUM('product', 'variant', 'brand')`);
        await queryRunner.query(`CREATE TABLE "media_attachment" ("id" SERIAL NOT NULL, "entity_id" integer NOT NULL, "entity_type" "public"."media_attachment_entity_type_enum" NOT NULL, "order" integer NOT NULL, "media_id" integer NOT NULL, CONSTRAINT "PK_b13383401c0375193cc36b3939f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a8bf18d44b45a9a03c9c3506d2" ON "media_attachment" ("entity_id", "entity_type") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_caedd3592b9ed7ff7b0f0b0351" ON "media_attachment" ("media_id", "entity_id", "entity_type") `);
        await queryRunner.query(`CREATE TABLE "product_categories_category" ("product_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_7f70030c0bafd63dd3c752c283f" PRIMARY KEY ("product_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3ec3ff94ca5f4280dc97efbe30" ON "product_categories_category" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c6a3b7332ec4134998c5a176ed" ON "product_categories_category" ("category_id") `);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD CONSTRAINT "FK_108ea75f9ea9abdcfa7100460bb" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_b6b2a4f1f533d89d218e70db941" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_b616e11e081d5f5508398825485" FOREIGN KEY ("variant_id") REFERENCES "product_variant_entity"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_f091e86a234693a49084b4c2c86" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_snapshot" ADD CONSTRAINT "FK_d6c0913ff439400680dac74a6e2" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media_attachment" ADD CONSTRAINT "FK_00411bf561573f87077e0ee90a7" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_categories_category" ADD CONSTRAINT "FK_3ec3ff94ca5f4280dc97efbe309" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_categories_category" ADD CONSTRAINT "FK_c6a3b7332ec4134998c5a176ed6" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_categories_category" DROP CONSTRAINT "FK_c6a3b7332ec4134998c5a176ed6"`);
        await queryRunner.query(`ALTER TABLE "product_categories_category" DROP CONSTRAINT "FK_3ec3ff94ca5f4280dc97efbe309"`);
        await queryRunner.query(`ALTER TABLE "media_attachment" DROP CONSTRAINT "FK_00411bf561573f87077e0ee90a7"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`);
        await queryRunner.query(`ALTER TABLE "item_snapshot" DROP CONSTRAINT "FK_d6c0913ff439400680dac74a6e2"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_f091e86a234693a49084b4c2c86"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_b616e11e081d5f5508398825485"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_b6b2a4f1f533d89d218e70db941"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP CONSTRAINT "FK_108ea75f9ea9abdcfa7100460bb"`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c6a3b7332ec4134998c5a176ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3ec3ff94ca5f4280dc97efbe30"`);
        await queryRunner.query(`DROP TABLE "product_categories_category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_caedd3592b9ed7ff7b0f0b0351"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8bf18d44b45a9a03c9c3506d2"`);
        await queryRunner.query(`DROP TABLE "media_attachment"`);
        await queryRunner.query(`DROP TYPE "public"."media_attachment_entity_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_media_is_deleted_expires_at"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TYPE "public"."media_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "item_snapshot"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_cart_user"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_cart_item_variant"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
        await queryRunner.query(`DROP TABLE "product_variant_entity"`);
        await queryRunner.query(`DROP TABLE "brand"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_address_user_default"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }

}
