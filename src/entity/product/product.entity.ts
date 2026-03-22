import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../category.entity';
import { Brand } from '../brand.entity';
import { ProductVariantEntity } from './product-variant.entity';
import { productStatuses } from './const';
import type { ProductStatus } from './types';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'unlisted', enum: productStatuses, type: 'simple-enum' })
  status: ProductStatus;

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariantEntity[];

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable()
  categories: Category[];

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brandId' })
  brand: Brand | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
