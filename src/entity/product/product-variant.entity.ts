import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ProductOptionEntity } from './product-option.entity';

@Entity()
export class ProductVariantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int' })
  costPerItem: number;

  @Column({ nullable: true, type: 'int', default: null })
  compareAt: number | null;

  @ManyToOne(() => ProductOptionEntity, (option) => option.variants, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
    nullable: false,
  })
  option: ProductOptionEntity;
}
