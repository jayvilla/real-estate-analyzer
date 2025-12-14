import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('feature_flags')
@Index(['name'], { unique: true })
export class FeatureFlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  enabled!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  targetUsers?: string[]; // User IDs

  @Column({ type: 'jsonb', nullable: true })
  targetOrganizations?: string[]; // Organization IDs

  @Column({ type: 'integer', nullable: true })
  rolloutPercentage?: number; // 0-100

  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

