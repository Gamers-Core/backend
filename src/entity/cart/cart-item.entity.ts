import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ProductVariantEntity } from '../product';
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

  @ManyToOne(() => ProductVariantEntity, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  variant: ProductVariantEntity;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
