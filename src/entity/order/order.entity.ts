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

import { User } from '../user.entity';
import { orderStatuses, paymentMethods, paymentStatuses } from './const';
import type { OrderAddressSnapshot, OrderStatus, PaymentMethod, PaymentStatus } from './types';
import { ItemSnapshot } from './item-snapshot.entity';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ default: 'pending', enum: orderStatuses, type: 'simple-enum' })
  status: OrderStatus;

  @Column({ default: 'unpaid', enum: paymentStatuses, type: 'simple-enum' })
  paymentStatus: PaymentStatus;

  @Column({ default: 'cod', enum: paymentMethods, type: 'simple-enum' })
  paymentMethod: PaymentMethod;

  @OneToMany(() => ItemSnapshot, (item) => item.order, { cascade: true })
  items: ItemSnapshot[];

  @Column({ type: 'simple-json' })
  shippingAddress: OrderAddressSnapshot;

  @Column({ nullable: true, type: 'text' })
  note: string | null;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  trackingNumber: string | null;

  @Column({ default: false })
  canOpenPackage: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'EGP' })
  currency: string;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @Column({ nullable: true, type: 'timestamp' })
  paidAt: Date | null;

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
