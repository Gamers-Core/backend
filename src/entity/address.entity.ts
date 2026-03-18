import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity()
@Index('UQ_address_user_default', ['user'], {
  unique: true,
  where: 'isDefault = true',
})
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  @Column({ type: 'text' })
  detailedAddress: string;

  @Column()
  districtId: string;

  @Column()
  districtName: string;

  @Column()
  cityId: string;

  @Column()
  cityName: string;

  @Column()
  nameAr: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
