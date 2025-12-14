import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @OneToMany(() => UserEntity, (user) => user.organization)
  users?: UserEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

