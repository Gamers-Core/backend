import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ enum: mediaTypes })
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
}
