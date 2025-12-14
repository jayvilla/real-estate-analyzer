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
import { SummaryType, SummaryFormat, SummaryLanguage } from '@real-estate-analyzer/types';

@Entity('summaries')
@Index(['organizationId', 'type', 'generatedAt'])
@Index(['organizationId', 'generatedAt'])
export class SummaryEntity {
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

  @Column({ type: 'enum', enum: SummaryType })
  type!: SummaryType;

  @Column({ type: 'uuid', nullable: true })
  propertyId?: string;

  @Column({ type: 'uuid', nullable: true })
  dealId?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'jsonb' })
  data!: any; // Stores highlights, metrics, recommendations, etc.

  @Column({ type: 'enum', enum: SummaryFormat, default: SummaryFormat.TEXT })
  format!: SummaryFormat;

  @Column({ type: 'enum', enum: SummaryLanguage, default: SummaryLanguage.EN })
  language!: SummaryLanguage;

  @Column({ type: 'varchar', length: 255, nullable: true })
  templateId?: string;

  @CreateDateColumn()
  generatedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

