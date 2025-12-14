import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DealEntity } from '../../deal/entities/deal.entity';
import { ScoringCriteria, ScoringWeights } from '@real-estate-analyzer/types';

@Entity('deal_scores')
@Index(['dealId', 'calculatedAt'])
@Index(['dealId', 'version'])
export class DealScoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  dealId!: string;

  @ManyToOne(() => DealEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealId' })
  deal?: DealEntity;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  overallScore!: number; // 0-100

  @Column({ type: 'jsonb' })
  criteria!: ScoringCriteria;

  @Column({ type: 'jsonb' })
  weights!: ScoringWeights;

  @Column({ type: 'int', default: 1 })
  version!: number; // Algorithm version

  @CreateDateColumn()
  calculatedAt!: Date;
}

