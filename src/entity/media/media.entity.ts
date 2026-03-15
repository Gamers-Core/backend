import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Collection } from '../collection.entity';
import { Product } from '../product';
import { mediaTypes } from './const';
import type { MediaType } from './types';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ unique: true })
  publicId: string;

  @Column({ enum: mediaTypes, type: 'simple-enum', default: 'auto' })
  type: MediaType;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  format: string;

  @Column()
  bytes: number;

  @OneToOne(() => Collection, (collection) => collection.image)
  collection: Collection | null;

  @ManyToOne(() => Product, (product) => product.media)
  product: Product | null;

  @CreateDateColumn()
  createdAt: Date;
}
