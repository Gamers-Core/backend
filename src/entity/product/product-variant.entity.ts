import { randomUUID } from 'node:crypto';
import {
  BeforeInsert,
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from './product.entity';

@Entity()
@Check(
  'CHK_variant_compareAt_gt_price',
  '"compareAt" IS NULL OR "compareAt" > "price"',
)
export class ProductVariantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 36 })
  externalId: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  name: string | null;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  costPerItem: number;

  @Column({ nullable: true, type: 'int', default: null })
  compareAt: number | null;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  @BeforeInsert()
  ensureExternalId() {
    if (!this.externalId) this.externalId = randomUUID();
  }
}
