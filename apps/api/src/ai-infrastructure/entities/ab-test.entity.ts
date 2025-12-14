import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ab_tests')
export class ABTestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  variants!: any[]; // Array of ABTestVariant

  @Column({ type: 'jsonb' })
  trafficSplit!: number[]; // Percentage for each variant

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb' })
  metrics!: string[]; // Metrics to track

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity('ab_test_assignments')
@Index(['userId', 'testId'], { unique: true })
@Index(['organizationId', 'testId'])
export class ABTestAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @Column({ type: 'uuid' })
  testId!: string;

  @Column({ type: 'uuid' })
  variantId!: string;

  @CreateDateColumn()
  assignedAt!: Date;
}

