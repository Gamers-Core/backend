import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthUserRework1775829200000 implements MigrationInterface {
  name = 'AuthUserRework1775829200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "password"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password" character varying`);
    await queryRunner.query(`UPDATE "user" SET "password" = '' WHERE "password" IS NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);

    await queryRunner.query(`UPDATE "user" SET "name" = '' WHERE "name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL`);
  }
}
