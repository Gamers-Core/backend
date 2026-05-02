import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { mediaTypes } from '../const';
import type { MediaType } from '../types';

@Entity()
@Index('idx_media_is_deleted_expires_at', ['isDeleted', 'expiresAt'])
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  src: string;

  @Column({ unique: true })
  publicId: string;

  @Column('enum', { enum: mediaTypes })
  type: MediaType;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  format: string;

  @Column()
  bytes: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column('timestamp', { nullable: true })
  expiresAt: Date | null;

  get isDraft(): boolean {
    return this.expiresAt !== null;
  }

  get isOrphaned(): boolean {
    return this.expiresAt !== null && this.expiresAt < new Date();
  }
}
