import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { parse } from 'src/common/transformers/parse.transformer';
import type { Localized } from 'src/i18n/types';
import { Product } from 'src/products/entities/product.entity';

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
