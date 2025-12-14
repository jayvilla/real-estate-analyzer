import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_usage_analytics')
@Index(['feature', 'organizationId', 'timestamp'])
@Index(['provider', 'timestamp'])
export class AIUsageAnalyticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  feature!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ type: 'varchar', length: 50 })
  provider!: string;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'integer', default: 1 })
  requestCount!: number;

  @Column({ type: 'boolean' })
  success!: boolean;

  @Column({ type: 'integer', nullable: true })
  responseTime?: number; // milliseconds

  @Column({ type: 'integer', default: 0 })
  tokensUsed!: number;

  @Column({ type: 'decimal', precision: 12, scale: 6, default: 0 })
  cost!: number; // USD

  @Column({ type: 'varchar', length: 50, nullable: true })
  errorCode?: string;

  @CreateDateColumn()
  timestamp!: Date;
}

