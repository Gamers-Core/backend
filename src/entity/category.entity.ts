import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { type Localized } from 'src/i18n';
import { parse } from 'src/common';

import { Product } from './product';

@Entity()
//TODO: handle unique constraint on jsonb column.
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { transformer: parse })
  name: Localized;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
