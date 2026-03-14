import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { productStatuses } from './const';
import { Category } from './category.entity';
import { Collection } from './collection.entity';
import type { ProductOption, ProductStatus } from './types';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'unlisted', enum: productStatuses, type: 'enum' })
  status: ProductStatus;

  @Column({ nullable: true, type: 'simple-json' })
  options: ProductOption[] | null;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({ name: 'products_categories' })
  categories: Category[];

  @ManyToMany(() => Collection, (collection) => collection.products)
  @JoinTable({ name: 'products_collections' })
  collections: Collection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
