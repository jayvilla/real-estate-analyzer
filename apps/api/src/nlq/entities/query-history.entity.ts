import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationEntity } from '../../organization/entities/organization.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('query_history')
@Index(['userId', 'organizationId', 'timestamp'])
@Index(['organizationId', 'timestamp'])
export class QueryHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: OrganizationEntity;

  @Column({ type: 'text' })
  query!: string;

  @Column({ type: 'jsonb' })
  structuredQuery!: any;

  @Column({ type: 'integer', default: 0 })
  resultCount!: number;

  @Column({ type: 'integer' })
  executionTime!: number; // milliseconds

  @CreateDateColumn()
  timestamp!: Date;
}

