import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { parse } from 'src/common/transformers/parse.transformer';
import type { Localized } from 'src/i18n/types';
import { Media } from 'src/media/entities/media.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { transformer: parse })
  name: Localized;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  image: Media | null;
}
