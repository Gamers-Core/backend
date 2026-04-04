import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { parse } from 'src/common';
import { type Localized } from 'src/i18n';

import { Variant } from './product';

@Entity()
export class FeaturedVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Variant, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'variantId' })
  variant: Variant;

  @Column('jsonb', { transformer: parse })
  title: Localized;

  @Column('int')
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
