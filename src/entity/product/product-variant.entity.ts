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
@Check('CHK_variant_compareAt_gt_price', '"compare_at" IS NULL OR "compare_at" > "price"')
export class ProductVariant {
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

  @Column('int')
  stock: number;

  @Column('int')
  price: number;

  @Column('int')
  costPerItem: number;

  @Column('int', { name: 'compare_at', nullable: true, default: null })
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
