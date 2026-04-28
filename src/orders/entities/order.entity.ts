import { customAlphabet } from 'nanoid';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { parse } from 'src/common/transformers/parse.transformer';
import { User } from 'src/users/entities/user.entity';

import { orderStatuses, paymentMethods, paymentStatuses } from '../statuses';
import type { OrderAddressSnapshot, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

import { ItemSnapshot } from './item-snapshot.entity';
import { OrderStatusHistory } from './order-status-history.entity';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @Column('enum', { default: 'pending', enum: orderStatuses })
  status: OrderStatus;

  @Column('enum', { default: 'unpaid', enum: paymentStatuses })
  paymentStatus: PaymentStatus;

  @Column('enum', { default: 'cod', enum: paymentMethods })
  paymentMethod: PaymentMethod;

  @OneToMany(() => ItemSnapshot, (item) => item.order, { cascade: true })
  items: ItemSnapshot[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  history: OrderStatusHistory[];

  @Column('jsonb', { transformer: parse })
  shippingAddress: OrderAddressSnapshot;

  @Column('text', { nullable: true })
  note: string | null;

  @Column('varchar', { nullable: true, length: 255 })
  trackingNumber: string | null;

  @Column({ default: false })
  canOpenPackage: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('varchar', { default: 'EGP' })
  currency: string;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  ensureOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (!this.orderNumber) this.orderNumber = `GC-${date}-${nanoid()}`;
  }
}
