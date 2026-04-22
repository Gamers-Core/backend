import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPoliciesEntity1776509000000 implements MigrationInterface {
  name = 'AddPoliciesEntity1776509000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.policy') IS NULL AND to_regclass('public.policies') IS NOT NULL THEN
          ALTER TABLE "public"."policies" RENAME TO "policy";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'policies_type_enum')
           AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'policy_type_enum') THEN
          ALTER TYPE "public"."policies_type_enum" RENAME TO "policy_type_enum";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'policy_type_enum') THEN
          CREATE TYPE "public"."policy_type_enum" AS ENUM('terms-of-service', 'shipping', 'refund', 'privacy');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "policy" (
        "id" SERIAL NOT NULL,
        "type" "public"."policy_type_enum" NOT NULL,
        "value" jsonb NOT NULL,
        "version" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_policy_type_version" UNIQUE ("type", "version"),
        CONSTRAINT "PK_policy_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          WHERE t.relname = 'policy' AND c.conname = 'UQ_policies_type_version'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          WHERE t.relname = 'policy' AND c.conname = 'UQ_policy_type_version'
        ) THEN
          ALTER TABLE "public"."policy" RENAME CONSTRAINT "UQ_policies_type_version" TO "UQ_policy_type_version";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          WHERE t.relname = 'policy' AND c.conname = 'PK_policies_id'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          WHERE t.relname = 'policy' AND c.conname = 'PK_policy_id'
        ) THEN
          ALTER TABLE "public"."policy" RENAME CONSTRAINT "PK_policies_id" TO "PK_policy_id";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF to_regclass('public.idx_policies_type_version') IS NOT NULL
           AND to_regclass('public.idx_policy_type_version') IS NULL THEN
          ALTER INDEX "public"."idx_policies_type_version" RENAME TO "idx_policy_type_version";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_policy_type_version" ON "policy" ("type", "version" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_policy_type_version"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "policy"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."policy_type_enum"`);
  }
}
