import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import type { OrderStatus } from './types';
import { Order } from './order.entity';
import { orderStatuses } from './const';

@Entity()
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.history, { onDelete: 'CASCADE', nullable: false })
  order: Order;

  @Column('enum', { enum: orderStatuses })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;
}
