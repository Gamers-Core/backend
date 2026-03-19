import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Media } from './media.entity';
import { mediaEntityType } from './const';
import type { MediaEntityType } from './types';

@Entity()
@Index('idx_media_attachment_media_id', ['media'])
export class MediaAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Media, { onDelete: 'CASCADE', nullable: false })
  media: Media;

  @Column()
  entityId: number;

  @Column({ enum: mediaEntityType, type: 'simple-enum' })
  entityType: MediaEntityType;

  @Column({ default: 0 })
  order: number;
}
