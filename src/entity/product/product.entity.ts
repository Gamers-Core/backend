import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { productStatuses } from './const';
import type { ProductOption, ProductStatus } from './types';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'unlisted', enum: productStatuses, type: 'enum' })
  status: ProductStatus;

  @Column({ nullable: true, type: 'simple-json' })
  options: ProductOption[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
