import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from './product';
import { Media } from './media';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToOne(() => Media, (media) => media.collection)
  @JoinColumn()
  image: Media | null;

  @ManyToMany(() => Product, (product) => product.collections)
  products: Product[];
}
