import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from '../../organization/entities/organization.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('scheduled_summaries')
@Index(['organizationId', 'enabled', 'nextRun'])
export class ScheduledSummaryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: OrganizationEntity;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'jsonb' })
  options!: any; // SummaryOptions

  @Column({ type: 'jsonb' })
  schedule!: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
  };

  @Column({ type: 'text', array: true, default: [] })
  emailRecipients!: string[];

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastRun?: Date;

  @Column({ type: 'timestamp' })
  nextRun!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

