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

import { type Localized } from 'src/i18n';
import { parse } from 'src/common';

import { Category } from '../category.entity';
import { Brand } from '../brand.entity';
import { Variant } from './variant.entity';
import { productStatuses } from './const';
import type { ProductStatus } from './types';

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
