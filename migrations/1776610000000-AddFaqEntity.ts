import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFaqEntity1776610000000 implements MigrationInterface {
  name = 'AddFaqEntity1776610000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasFAQTable = await queryRunner.hasTable('faq');
    if (hasFAQTable) return;

    await queryRunner.query(`
      CREATE TABLE "faq" (
        "id" SERIAL NOT NULL,
        "question" jsonb NOT NULL,
        "answer" jsonb NOT NULL,
        "position" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_faq_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_faq_position" UNIQUE ("position")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "faq"`);
  }
}