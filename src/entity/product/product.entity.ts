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

import { type Localized } from 'src/i18n';
import { parse } from 'src/common';

import { Category } from '../category.entity';
import { Brand } from '../brand.entity';
import { ProductVariant } from './product-variant.entity';
import { productStatuses } from './const';
import type { ProductStatus } from './types';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { transformer: parse })
  title: Localized;

  @Column('jsonb', { transformer: parse })
  description: Localized;

  @Column('enum', { default: 'unlisted', enum: productStatuses })
  status: ProductStatus;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

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
