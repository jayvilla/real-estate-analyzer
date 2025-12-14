import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationEntity } from '../../organization/entities/organization.entity';

@Entity('api_keys')
@Index(['organizationId', 'provider'])
@Index(['keyHash']) // For lookup
export class APIKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: OrganizationEntity;

  @Column({ type: 'varchar', length: 50 })
  provider!: string; // 'openai', 'anthropic', etc.

  @Column({ type: 'varchar', length: 255 })
  keyHash!: string; // Hashed API key for lookup

  @Column({ type: 'varchar', length: 255, nullable: true })
  keyPrefix!: string; // First 8 chars for identification

  @Column({ type: 'varchar', length: 100, nullable: true })
  name!: string; // User-friendly name

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  rateLimits!: any; // Provider-specific rate limits

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

