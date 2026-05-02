import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Product } from 'src/products/entities/product.entity';

import { Media } from './media.entity';

@Unique(['product', 'order'])
@Entity()
export class ProductMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Media, { onDelete: 'CASCADE', nullable: false })
  media: Media;

  @ManyToOne(() => Product, (p) => p.media, { nullable: false, onDelete: 'CASCADE' })
  product: Product;

  @Column()
  order: number;
}
