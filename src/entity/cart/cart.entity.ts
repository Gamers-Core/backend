import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../user.entity';
import { CartItem } from './cart-item.entity';

@Entity()
@Index('UQ_cart_user', ['user'], { unique: true })
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.cart, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
