import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';

import { Discount } from './discount.entity';

@Entity()
export class DiscountUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Discount, (discount) => discount.usages)
  discount: Discount;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Order)
  order: Order;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountAmount: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
