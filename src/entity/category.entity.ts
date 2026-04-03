import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { type Localized } from 'src/i18n';
import { parse } from 'src/common';

import { Product } from './product';

@Entity()
//TODO: handle unique constraint on jsonb column.
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { unique: true, transformer: parse })
  name: Localized;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
