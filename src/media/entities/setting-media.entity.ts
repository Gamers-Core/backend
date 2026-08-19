import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Setting } from 'src/settings/entities/setting.entity';

import { Media } from './media.entity';

@Unique(['setting', 'order'])
@Entity()
export class SettingMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Media, { onDelete: 'CASCADE', nullable: false })
  media: Media;

  @ManyToOne(() => Setting, (s) => s.media, { nullable: false, onDelete: 'CASCADE' })
  setting: Setting;

  @Column()
  order: number;
}
