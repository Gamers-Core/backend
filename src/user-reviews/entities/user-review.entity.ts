import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facebookURL: string;

  @Column('int', { unique: true })
  position: number;

  @CreateDateColumn()
  createdAt: Date;
}
