import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { parse } from 'src/common/transformers/parse.transformer';
import type { Localized } from 'src/i18n/types';

import { productStatuses } from '../const';
import type { ProductStatus } from '../types';

import { Variant } from './variant.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { transformer: parse })
  name: Localized;

  @Column('jsonb', { transformer: parse })
  title: Localized;

  @Column('jsonb', { transformer: parse })
  description: Localized;

  @Column('enum', { default: 'unlisted', enum: productStatuses })
  status: ProductStatus;

  @OneToMany(() => Variant, (variant) => variant.product, {
    cascade: true,
  })
  variants: Variant[];

  @ManyToOne(() => Category, (c) => c.products, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
