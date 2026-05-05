import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Address } from 'src/addresses/entities/address.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { defaultLocale, locales } from 'src/i18n/const';
import type { Locale } from 'src/i18n/types';
import { Order } from 'src/orders/entities/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: true })
  name: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column('enum', { default: defaultLocale, enum: locales })
  locale: Locale;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
