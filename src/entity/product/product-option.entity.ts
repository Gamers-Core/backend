import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from './product.entity';
import { ProductVariantEntity } from './product-variant.entity';

@Entity()
export class ProductOptionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Product, (product) => product.options, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  product: Product;

  @OneToMany(() => ProductVariantEntity, (variant) => variant.option, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  variants: ProductVariantEntity[];
}
