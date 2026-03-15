import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from './category.entity';
import { Collection } from './collection.entity';
import { Media } from '../media/media.entity';
import { productStatuses } from './const';
import type { ProductOption, ProductStatus } from './types';

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

  @Column({ nullable: true, type: 'simple-json' })
  options: ProductOption[] | null;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({ name: 'products_categories' })
  categories: Category[];

  @ManyToMany(() => Collection, (collection) => collection.products)
  @JoinTable({ name: 'products_collections' })
  collections: Collection[];

  @OneToMany(() => Media, (media) => media.id, { cascade: true })
  media: Media[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
