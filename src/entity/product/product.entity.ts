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

import { Category } from '../category.entity';
import { Collection } from '../collection.entity';
import { Media } from '../media';
import { ProductOptionEntity } from './product-option.entity';
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

  @OneToMany(() => ProductOptionEntity, (option) => option.product, {
    cascade: true,
  })
  options?: ProductOptionEntity[];

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Collection, (collection) => collection.products)
  @JoinTable()
  collections: Collection[];

  @OneToMany(() => Media, (media) => media.product)
  media: Media[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
