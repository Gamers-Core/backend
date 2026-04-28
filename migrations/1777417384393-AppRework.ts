import { MigrationInterface, QueryRunner } from "typeorm";

export class AppRework1777417384393 implements MigrationInterface {
    name = 'AppRework1777417384393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_71191894750adf3578d4f8def5a"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_b3931722e5fd238f75645f8d15"`);
        await queryRunner.query(`ALTER TABLE "policy" DROP CONSTRAINT "UQ_policy_type_version"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_history_status_enum" RENAME TO "order_status_history_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_history_status_enum" AS ENUM('pending', 'confirmed', 'on-hold', 'on-progress', 'shipped', 'delivered', 'completed', 'returned', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" TYPE "public"."order_status_history_status_enum" USING "status"::"text"::"public"."order_status_history_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_history_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."user_locale_enum" RENAME TO "user_locale_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_locale_enum" AS ENUM('en', 'ar')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "locale" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "locale" TYPE "public"."user_locale_enum" USING "locale"::"text"::"public"."user_locale_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "locale" SET DEFAULT 'en'`);
        await queryRunner.query(`DROP TYPE "public"."user_locale_enum_old"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "policy_id_seq" OWNED BY "policy"."id"`);
        await queryRunner.query(`ALTER TABLE "policy" ALTER COLUMN "id" SET DEFAULT nextval('"policy_id_seq"')`);
        await queryRunner.query(`ALTER TYPE "public"."media_type_enum" RENAME TO "media_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."media_type_enum" AS ENUM('auto', 'image', 'video', 'audio')`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "type" TYPE "public"."media_type_enum" USING "type"::"text"::"public"."media_type_enum"`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "type" SET DEFAULT 'auto'`);
        await queryRunner.query(`DROP TYPE "public"."media_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "faq" DROP CONSTRAINT "UQ_faq_position"`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_status_history_order_id_created_at" ON "order_status_history" ("order_id", "created_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_faq_position" ON "faq" ("position") `);
        await queryRunner.query(`ALTER TABLE "policy" ADD CONSTRAINT "UQ_e443e06c600beecd3af36a089a1" UNIQUE ("type", "version")`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c"`);
        await queryRunner.query(`ALTER TABLE "policy" DROP CONSTRAINT "UQ_e443e06c600beecd3af36a089a1"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."UQ_faq_position"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_order_status_history_order_id_created_at"`);
        await queryRunner.query(`ALTER TABLE "faq" ADD CONSTRAINT "UQ_faq_position" UNIQUE ("position")`);
        await queryRunner.query(`CREATE TYPE "public"."media_type_enum_old" AS ENUM('auto', 'image', 'video', 'raw')`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "type" TYPE "public"."media_type_enum_old" USING "type"::"text"::"public"."media_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "media" ALTER COLUMN "type" SET DEFAULT 'auto'`);
        await queryRunner.query(`DROP TYPE "public"."media_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."media_type_enum_old" RENAME TO "media_type_enum"`);
        await queryRunner.query(`ALTER TABLE "policy" ALTER COLUMN "id" SET DEFAULT nextval('policies_id_seq')`);
        await queryRunner.query(`ALTER TABLE "policy" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "policy_id_seq"`);
        await queryRunner.query(`CREATE TYPE "public"."user_locale_enum_old" AS ENUM('en', 'ar')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "locale" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "locale" TYPE "public"."user_locale_enum_old" USING "locale"::"text"::"public"."user_locale_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "locale" SET DEFAULT 'en'`);
        await queryRunner.query(`DROP TYPE "public"."user_locale_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_locale_enum_old" RENAME TO "user_locale_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_history_status_enum_old" AS ENUM('pending', 'confirmed', 'on-hold', 'on-progress', 'shipped', 'delivered', 'completed', 'returned', 'cancelled', 'unpaid', 'paid', 'refunded')`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" TYPE "public"."order_status_history_status_enum_old" USING "status"::"text"::"public"."order_status_history_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_history_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_history_status_enum_old" RENAME TO "order_status_history_status_enum"`);
        await queryRunner.query(`ALTER TABLE "policy" ADD CONSTRAINT "UQ_policy_type_version" UNIQUE ("type", "version")`);
        await queryRunner.query(`CREATE INDEX "IDX_b3931722e5fd238f75645f8d15" ON "order_status_history" ("created_at", "order_id") `);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_71191894750adf3578d4f8def5a" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
