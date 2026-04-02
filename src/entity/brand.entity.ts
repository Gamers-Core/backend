import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { type Localized } from 'src/i18n';
import { parse } from 'src/common';

import { Product } from './product';

@Entity()
// TODO: handle unique constraint on jsonb column.
@Index('brand_name_en_unique', { synchronize: false })
@Index('brand_name_ar_unique', { synchronize: false })
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { unique: true, transformer: parse })
  name: Localized;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
