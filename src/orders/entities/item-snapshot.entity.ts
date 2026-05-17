import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { parse } from 'src/common/transformers/parse.transformer';
import type { Localized } from 'src/i18n/types';

import { Order } from './order.entity';

@Entity()
export class ItemSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column('varchar', { length: 36 })
  variantExternalId: string;

  @Column('jsonb', { transformer: parse })
  productTitle: Localized;

  @Column('jsonb', { transformer: parse, nullable: true })
  variantName: Localized | null;

  @Column('int', { nullable: true })
  mediaId: number | null;

  @Column('varchar', { name: 'image_url', nullable: true, length: 2048 })
  imageURL: string | null;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  lineTotal: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  order: Order;
}
