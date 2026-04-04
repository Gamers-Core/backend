import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { parse } from 'src/common';
import { type Localized } from 'src/i18n';

import { Variant } from './product';

@Entity()
@Index('UQ_featured_variant_variantId', ['variant'], { unique: true })
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
