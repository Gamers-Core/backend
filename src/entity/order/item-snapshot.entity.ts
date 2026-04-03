import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { type Localized } from 'src/i18n';
import { parse } from 'src/common';

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

  @Column('jsonb', { transformer: parse })
  variantName: Localized;

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
