import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { parse } from 'src/common/transformers/parse.transformer';
import type { Localized } from 'src/i18n/types';

import { policyTypes } from '../const';
import type { PolicyType } from '../types';

@Entity()
@Index('idx_policy_type_version', ['type', 'version'])
@Unique(['type', 'version'])
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: policyTypes })
  type: PolicyType;

  @Column('jsonb', { transformer: parse })
  value: Localized;

  @Column({ type: 'int' })
  version: number;

  @CreateDateColumn()
  createdAt: Date;
}
