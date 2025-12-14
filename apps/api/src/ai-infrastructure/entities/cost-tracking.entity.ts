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

@Entity('ai_cost_tracking')
@Index(['organizationId', 'timestamp'])
@Index(['userId', 'timestamp'])
@Index(['provider', 'timestamp'])
@Index(['feature', 'timestamp'])
export class CostTrackingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization?: OrganizationEntity;

  @Column({ type: 'varchar', length: 50 })
  provider!: string;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'varchar', length: 100 })
  feature!: string; // 'property-analysis', 'nlq', 'summary', etc.

  @Column({ type: 'integer' })
  promptTokens!: number;

  @Column({ type: 'integer' })
  completionTokens!: number;

  @Column({ type: 'integer' })
  totalTokens!: number;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  estimatedCost!: number; // USD

  @CreateDateColumn()
  timestamp!: Date;
}

