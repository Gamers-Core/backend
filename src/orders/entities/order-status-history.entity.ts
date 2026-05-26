import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { orderHistoryStatuses, orderHistoryTypes } from '../statuses';
import type { OrderHistoryStatus, OrderHistoryType } from '../types';

import { Order } from './order.entity';

@Entity()
@Index('IDX_order_status_history_order_id_created_at', ['order', 'createdAt'])
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.history, { onDelete: 'CASCADE', nullable: false })
  order: Order;

  @Column('enum', { enum: orderHistoryTypes, enumName: 'order_status_history_type_enum' })
  type: OrderHistoryType;

  @Column('enum', {
    enum: orderHistoryStatuses,
    enumName: 'order_status_history_status_enum',
    nullable: true,
  })
  status: OrderHistoryStatus | null;

  @CreateDateColumn()
  createdAt: Date;
}
