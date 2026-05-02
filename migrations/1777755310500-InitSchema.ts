import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1777755310500 implements MigrationInterface {
    name = 'InitSchema1777755310500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "phone_number" character varying NOT NULL, "detailed_address" text NOT NULL, "district_id" character varying NOT NULL, "district_name" character varying NOT NULL, "city_id" character varying NOT NULL, "city_name" character varying NOT NULL, "city_drop_off" character varying NOT NULL, "name_ar" character varying NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_address_user_default" ON "address" ("user_id") WHERE is_default = true`);
        await queryRunner.query(`CREATE TABLE "item_snapshot" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "variant_external_id" character varying(36) NOT NULL, "product_title" jsonb NOT NULL, "variant_name" jsonb NOT NULL, "media_id" integer, "image_url" character varying(2048), "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "line_total" numeric(10,2) NOT NULL, "order_id" integer NOT NULL, CONSTRAINT "PK_6c56d4642fcc92bcdcdc640e571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_history_status_enum" AS ENUM('pending', 'confirmed', 'on-hold', 'on-progress', 'shipped', 'delivered', 'completed', 'returned', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "order_status_history" ("id" SERIAL NOT NULL, "status" "public"."order_status_history_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "order_id" integer NOT NULL, CONSTRAINT "PK_e6c66d853f155531985fc4f6ec8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_order_status_history_order_id_created_at" ON "order_status_history" ("order_id", "created_at") `);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'confirmed', 'on-hold', 'on-progress', 'shipped', 'delivered', 'completed', 'returned', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."order_payment_status_enum" AS ENUM('unpaid', 'paid', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."order_payment_method_enum" AS ENUM('cod', 'instapay', 'valu', 'card')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "order_number" character varying NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending', "payment_status" "public"."order_payment_status_enum" NOT NULL DEFAULT 'unpaid', "payment_method" "public"."order_payment_method_enum" NOT NULL DEFAULT 'cod', "shipping_address" jsonb NOT NULL, "note" text, "tracking_number" character varying(255), "can_open_package" boolean NOT NULL DEFAULT false, "subtotal" numeric(10,2) NOT NULL, "shipping_fee" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'EGP', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "UQ_f9180f384353c621e8d0c414c14" UNIQUE ("order_number"), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_locale_enum" AS ENUM('en', 'ar')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying, "email" character varying NOT NULL, "is_admin" boolean NOT NULL DEFAULT false, "locale" "public"."user_locale_enum" NOT NULL DEFAULT 'en', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."media_type_enum" AS ENUM('image', 'video', 'audio', 'raw')`);
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "src" character varying NOT NULL, "public_id" character varying NOT NULL, "type" "public"."media_type_enum" NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "format" character varying NOT NULL, "bytes" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP, CONSTRAINT "UQ_f1a0bdbaefaee954f099ccbd035" UNIQUE ("public_id"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_media_is_deleted_expires_at" ON "media" ("is_deleted", "expires_at") `);
        await queryRunner.query(`CREATE TABLE "brand" ("id" SERIAL NOT NULL, "name" jsonb NOT NULL, "image_id" integer, CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" jsonb NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_media" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "media_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "UQ_cfcf7407baa13cf91ea8f0f96d5" UNIQUE ("product_id", "order"), CONSTRAINT "PK_09d4639de8082a32aa27f3ac9a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_status_enum" AS ENUM('active', 'draft', 'unlisted')`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" jsonb NOT NULL, "title" jsonb NOT NULL, "description" jsonb NOT NULL, "status" "public"."product_status_enum" NOT NULL DEFAULT 'unlisted', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" integer NOT NULL, "brandId" integer NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_variant_entity" ("id" SERIAL NOT NULL, "external_id" character varying(36) NOT NULL, "name" jsonb, "is_active" boolean NOT NULL DEFAULT true, "stock" integer NOT NULL, "price" integer NOT NULL, "cost_per_item" integer NOT NULL, "compare_at" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "image_id" integer, "product_id" integer NOT NULL, CONSTRAINT "UQ_9f380aaa29ca501db9b2c2e4f46" UNIQUE ("external_id"), CONSTRAINT "CHK_variant_compareAt_gt_price" CHECK ("compare_at" IS NULL OR "compare_at" > "price"), CONSTRAINT "PK_7deac490766ad101c67289afc34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "cart_id" integer NOT NULL, "variant_id" integer NOT NULL, CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_cart_item_variant" ON "cart_item" ("cart_id", "variant_id") `);
        await queryRunner.query(`CREATE TABLE "cart" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "REL_f091e86a234693a49084b4c2c8" UNIQUE ("user_id"), CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_cart_user" ON "cart" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "user_review" ("id" SERIAL NOT NULL, "facebook_url" character varying NOT NULL, "position" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "image_id" integer, CONSTRAINT "UQ_5d532ef1b222532b3fe5d60ce55" UNIQUE ("position"), CONSTRAINT "PK_261724703ac0fe70a85eb3f3af6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."policy_type_enum" AS ENUM('terms-of-service', 'shipping', 'refund', 'privacy')`);
        await queryRunner.query(`CREATE TABLE "policy" ("id" SERIAL NOT NULL, "type" "public"."policy_type_enum" NOT NULL, "value" jsonb NOT NULL, "version" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e443e06c600beecd3af36a089a1" UNIQUE ("type", "version"), CONSTRAINT "PK_9917b0c5e4286703cc656b1d39f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_policy_type_version" ON "policy" ("type", "version") `);
        await queryRunner.query(`CREATE TABLE "featured_variant" ("id" SERIAL NOT NULL, "title" jsonb NOT NULL, "position" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "variantId" integer NOT NULL, CONSTRAINT "PK_908ef314aeafa3d7b4b4bd2926c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_featured_variant_variantId" ON "featured_variant" ("variantId") `);
        await queryRunner.query(`CREATE TABLE "faq" ("id" SERIAL NOT NULL, "question" jsonb NOT NULL, "answer" jsonb NOT NULL, "position" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d6f5a52b1a96dd8d0591f9fbc47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_faq_position" ON "faq" ("position") `);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_snapshot" ADD CONSTRAINT "FK_d6c0913ff439400680dac74a6e2" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brand" ADD CONSTRAINT "FK_61e0b28afe71313d16ac27a72fd" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_media" ADD CONSTRAINT "FK_b0895b1d84d747625a54b7fe9cf" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_media" ADD CONSTRAINT "FK_e6bb4a69096db4f6a1f5bada151" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD CONSTRAINT "FK_cffcc03ff205e2fe1f28f4d1a37" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" ADD CONSTRAINT "FK_108ea75f9ea9abdcfa7100460bb" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_b6b2a4f1f533d89d218e70db941" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_b616e11e081d5f5508398825485" FOREIGN KEY ("variant_id") REFERENCES "product_variant_entity"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_f091e86a234693a49084b4c2c86" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_review" ADD CONSTRAINT "FK_7d9dcca5f02fb7ab81657f1b18e" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "featured_variant" ADD CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944" FOREIGN KEY ("variantId") REFERENCES "product_variant_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "featured_variant" DROP CONSTRAINT "FK_91a7d9e04be5da0b1ba8bea3944"`);
        await queryRunner.query(`ALTER TABLE "user_review" DROP CONSTRAINT "FK_7d9dcca5f02fb7ab81657f1b18e"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_f091e86a234693a49084b4c2c86"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_b616e11e081d5f5508398825485"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_b6b2a4f1f533d89d218e70db941"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP CONSTRAINT "FK_108ea75f9ea9abdcfa7100460bb"`);
        await queryRunner.query(`ALTER TABLE "product_variant_entity" DROP CONSTRAINT "FK_cffcc03ff205e2fe1f28f4d1a37"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`);
        await queryRunner.query(`ALTER TABLE "product_media" DROP CONSTRAINT "FK_e6bb4a69096db4f6a1f5bada151"`);
        await queryRunner.query(`ALTER TABLE "product_media" DROP CONSTRAINT "FK_b0895b1d84d747625a54b7fe9cf"`);
        await queryRunner.query(`ALTER TABLE "brand" DROP CONSTRAINT "FK_61e0b28afe71313d16ac27a72fd"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c"`);
        await queryRunner.query(`ALTER TABLE "item_snapshot" DROP CONSTRAINT "FK_d6c0913ff439400680dac74a6e2"`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_faq_position"`);
        await queryRunner.query(`DROP TABLE "faq"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_featured_variant_variantId"`);
        await queryRunner.query(`DROP TABLE "featured_variant"`);
        await queryRunner.query(`DROP INDEX "public"."idx_policy_type_version"`);
        await queryRunner.query(`DROP TABLE "policy"`);
        await queryRunner.query(`DROP TYPE "public"."policy_type_enum"`);
        await queryRunner.query(`DROP TABLE "user_review"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_cart_user"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_cart_item_variant"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`DROP TABLE "product_variant_entity"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
        await queryRunner.query(`DROP TABLE "product_media"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "brand"`);
        await queryRunner.query(`DROP INDEX "public"."idx_media_is_deleted_expires_at"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TYPE "public"."media_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_locale_enum"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_order_status_history_order_id_created_at"`);
        await queryRunner.query(`DROP TABLE "order_status_history"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_history_status_enum"`);
        await queryRunner.query(`DROP TABLE "item_snapshot"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_address_user_default"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }

}
