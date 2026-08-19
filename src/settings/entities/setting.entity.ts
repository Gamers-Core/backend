import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { SettingMedia } from 'src/media/entities/setting-media.entity';

import type { SettingKey, SettingsMap } from '../types';

@Entity()
export class Setting<K extends SettingKey = SettingKey> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: K;

  @Column('jsonb')
  value: SettingsMap[K];

  @OneToMany(() => SettingMedia, (m) => m.setting, { cascade: true })
  media: SettingMedia[];
}
