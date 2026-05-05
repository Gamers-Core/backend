import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Media } from 'src/media/entities/media.entity';

@Entity()
export class UserReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facebookURL: string;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  image: Media | null;

  @Column('int', { unique: true })
  position: number;

  @CreateDateColumn()
  createdAt: Date;
}
