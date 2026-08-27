import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { paymentMethods } from 'src/orders/statuses';
import type { PaymentMethod } from 'src/orders/types';
import { Variant } from 'src/products/entities/variant.entity';
import { User } from 'src/users/entities/user.entity';

import { discountEligibilities, discountMethods, discountTargets, discountValueTypes } from '../const';
import type { DiscountEligibility, DiscountMethod, DiscountTarget, DiscountValueType } from '../types';

import { DiscountUsage } from './discount-usage.entity';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true, where: '"code" IS NOT NULL' })
  @Column('varchar', { nullable: true })
  code: string | null;

  @Column({ type: 'enum', enum: discountMethods })
  method: DiscountMethod;

  @Column({ type: 'enum', enum: discountTargets })
  target: DiscountTarget;

  @Column({ type: 'enum', enum: paymentMethods, array: true, nullable: true })
  paymentMethods: PaymentMethod[] | null;

  @Column({ type: 'enum', enum: discountValueTypes, nullable: true })
  valueType: DiscountValueType | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  value: number | null;

  @Column({ type: 'enum', enum: discountEligibilities, default: 'all_users' })
  eligibility: DiscountEligibility;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderAmount: number | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column('int', { nullable: true })
  usageLimit: number | null;

  @Column('int', { default: 0 })
  usageCount: number;

  @Column('int', { nullable: true })
  usageLimitPerUser: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column('timestamp', { nullable: true })
  startsAt: Date | null;

  @Column('timestamp', { nullable: true })
  expiresAt: Date | null;

  @ManyToMany(() => Variant)
  @JoinTable()
  variants: Variant[];

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Brand)
  @JoinTable()
  brands: Brand[];

  @ManyToMany(() => User)
  @JoinTable()
  eligibleUsers: User[];

  @OneToMany(() => DiscountUsage, (usage) => usage.discount)
  usages: DiscountUsage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
