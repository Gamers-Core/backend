import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserReviewToMediaAttachmentEntityTypeEnum1775653000000 implements MigrationInterface {
  name = 'AddUserReviewToMediaAttachmentEntityTypeEnum1775653000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."media_attachment_entity_type_enum" ADD VALUE IF NOT EXISTS 'user-review'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const isUserReviewInUse = await queryRunner.query(`
      SELECT 1
      FROM "media_attachment"
      WHERE "entity_type"::text = 'user-review'
      LIMIT 1
    `);

    if (isUserReviewInUse.length) {
      throw new Error("Cannot revert enum change while 'user-review' attachments exist");
    }

    const hasUserReviewValue = await queryRunner.query(`
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname = 'media_attachment_entity_type_enum'
        AND e.enumlabel = 'user-review'
      LIMIT 1
    `);

    if (!hasUserReviewValue.length) return;

    await queryRunner.query(`ALTER TYPE "public"."media_attachment_entity_type_enum" RENAME TO "media_attachment_entity_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."media_attachment_entity_type_enum" AS ENUM('product', 'variant', 'brand')`,
    );
    await queryRunner.query(`
      ALTER TABLE "media_attachment"
      ALTER COLUMN "entity_type"
      TYPE "public"."media_attachment_entity_type_enum"
      USING "entity_type"::text::"public"."media_attachment_entity_type_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."media_attachment_entity_type_enum_old"`);
  }
}
