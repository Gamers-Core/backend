import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from './product.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
