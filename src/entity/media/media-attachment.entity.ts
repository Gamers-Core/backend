import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Media } from './media.entity';
import { mediaEntityType } from './const';
import type { MediaEntityType } from './types';

@Entity()
@Index(['media', 'entityId', 'entityType'], { unique: true })
@Index(['entityId', 'entityType'])
export class MediaAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Media, { onDelete: 'CASCADE', nullable: false })
  media: Media;

  @Column()
  entityId: number;

  @Column({ enum: mediaEntityType, type: 'simple-enum' })
  entityType: MediaEntityType;

  @Column()
  order: number;
}
