import { MigrationInterface, QueryRunner } from "typeorm";

export class TransformSimpleEnumsToEnums1775057479975 implements MigrationInterface {
    name = 'TransformSimpleEnumsToEnums1775057479975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "locale"`);
        await queryRunner.query(`CREATE TYPE "public"."user_locale_enum" AS ENUM('en', 'ar')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "locale" "public"."user_locale_enum" NOT NULL DEFAULT 'en'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "locale"`);
        await queryRunner.query(`DROP TYPE "public"."user_locale_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "locale" character varying NOT NULL DEFAULT 'en'`);
    }

}
