import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import type { OrderStatus } from './types';
import { Order } from './order.entity';
import { orderStatuses } from './const';

@Entity()
@Index('IDX_order_status_history_order_id_created_at', ['order', 'createdAt'])
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
