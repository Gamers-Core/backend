import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { parse } from 'src/common';
import { type Localized } from 'src/i18n';

@Entity()
@Index('UQ_faq_position', ['position'], { unique: true })
export class FAQ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { transformer: parse })
  question: Localized;

  @Column('jsonb', { transformer: parse })
  answer: Localized;

  @Column('int')
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
