import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { type Localized } from 'src/i18n';
import { parse } from 'src/common';

import { Product } from './product';

@Entity()
//TODO: handle unique constraint on jsonb column.
@Index('category_name_en_unique', { synchronize: false })
@Index('category_name_ar_unique', { synchronize: false })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { unique: true, transformer: parse })
  name: Localized;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
