import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import type { SettingKey, SettingsMap } from '../types';

@Entity()
export class Setting<K extends SettingKey = SettingKey> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: K;

  @Column('jsonb')
  value: SettingsMap[K];
}
