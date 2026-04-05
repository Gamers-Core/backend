import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserReviewsEntity1775414694306 implements MigrationInterface {
    name = 'AddUserReviewsEntity1775414694306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasUserReviewTable = await queryRunner.hasTable('user_review');

        if (!hasUserReviewTable) {
            await queryRunner.query(`
                CREATE TABLE "user_review" (
                    "id" SERIAL NOT NULL,
                    "facebook_url" character varying NOT NULL,
                    "position" integer NOT NULL,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_1532e0f1d2f1670628a0353370b" PRIMARY KEY ("id"),
                    CONSTRAINT "UQ_5d532ef1b222532b3fe5d60ce55" UNIQUE ("position")
                )
            `);

            await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_review_position_enum"`);
            return;
        }

        const hasLegacyFacebookColumn = await queryRunner.hasColumn('user_review', 'facebookURL');

        if (hasLegacyFacebookColumn) {
            const hasSnakeCaseFacebookColumn = await queryRunner.hasColumn('user_review', 'facebook_url');

            if (hasSnakeCaseFacebookColumn) {
                await queryRunner.query(`
                    UPDATE "user_review"
                    SET "facebook_url" = COALESCE("facebook_url", "facebookURL")
                    WHERE "facebook_url" IS NULL
                `);
                await queryRunner.query(`ALTER TABLE "user_review" DROP COLUMN "facebookURL"`);
            } else {
                await queryRunner.query(`ALTER TABLE "user_review" RENAME COLUMN "facebookURL" TO "facebook_url"`);
            }
        }

        const hasPositionColumn = await queryRunner.hasColumn('user_review', 'position');

        if (!hasPositionColumn) {
            await queryRunner.query(`ALTER TABLE "user_review" ADD "position" integer`);
        } else {
            await queryRunner.query(`ALTER TABLE "user_review" DROP CONSTRAINT IF EXISTS "UQ_5d532ef1b222532b3fe5d60ce55"`);
            await queryRunner.query(`ALTER TABLE "user_review" ALTER COLUMN "position" DROP DEFAULT`);
            await queryRunner.query(`ALTER TABLE "user_review" ALTER COLUMN "position" TYPE integer USING ("position"::text::integer)`);
        }

        await queryRunner.query(`ALTER TABLE "user_review" ALTER COLUMN "position" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_review" ADD CONSTRAINT "UQ_5d532ef1b222532b3fe5d60ce55" UNIQUE ("position")`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_review_position_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasUserReviewTable = await queryRunner.hasTable('user_review');

        if (!hasUserReviewTable) return;

        await queryRunner.query(`ALTER TABLE "user_review" DROP CONSTRAINT IF EXISTS "UQ_5d532ef1b222532b3fe5d60ce55"`);
        await queryRunner.query(`ALTER TABLE "user_review" DROP COLUMN IF EXISTS "position"`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_type
                    WHERE typname = 'user_review_position_enum'
                ) THEN
                    CREATE TYPE "public"."user_review_position_enum" AS ENUM('1', '2', '3');
                END IF;
            END
            $$;
        `);
        await queryRunner.query(`ALTER TABLE "user_review" ADD "position" "public"."user_review_position_enum" NOT NULL DEFAULT '1'`);

        const hasSnakeCaseFacebookColumn = await queryRunner.hasColumn('user_review', 'facebook_url');
        const hasLegacyFacebookColumn = await queryRunner.hasColumn('user_review', 'facebookURL');

        if (hasSnakeCaseFacebookColumn && !hasLegacyFacebookColumn)
            await queryRunner.query(`ALTER TABLE "user_review" RENAME COLUMN "facebook_url" TO "facebookURL"`);
    }

}
