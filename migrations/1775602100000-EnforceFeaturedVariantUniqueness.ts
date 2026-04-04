import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

export class EnforceFeaturedVariantUniqueness1775602100000 implements MigrationInterface {
  name = 'EnforceFeaturedVariantUniqueness1775602100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('featured_variant');
    if (!table) return;

    const hasUniqueOnVariantId = table.uniques.some(
      (unique) => unique.columnNames.length === 1 && unique.columnNames[0] === 'variantId',
    );

    if (hasUniqueOnVariantId) return;

    await queryRunner.query(`
      DELETE FROM "featured_variant" current
      USING "featured_variant" duplicate
      WHERE current."variantId" = duplicate."variantId"
        AND current."id" > duplicate."id"
    `);

    await queryRunner.createUniqueConstraint(
      'featured_variant',
      new TableUnique({
        name: 'UQ_featured_variant_variantId',
        columnNames: ['variantId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('featured_variant');
    if (!table) return;

    const uniqueConstraint = table.uniques.find((unique) => unique.name === 'UQ_featured_variant_variantId');
    if (!uniqueConstraint) return;

    await queryRunner.dropUniqueConstraint('featured_variant', uniqueConstraint);
  }
}
