import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Variant } from 'src/products/entities/variant.entity';

import { Cart } from './cart.entity';

@Entity()
@Index('UQ_cart_item_variant', ['cart', 'variant'], {
  unique: true,
})
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  cart: Cart;

  @ManyToOne(() => Variant, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  variant: Variant;

  @Column('int')
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
