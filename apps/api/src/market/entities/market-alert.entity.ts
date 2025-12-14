import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum MarketAlertType {
  PRICE_CHANGE = 'price_change',
  RENT_CHANGE = 'rent_change',
  INVENTORY_CHANGE = 'inventory_change',
  APPRECIATION_CHANGE = 'appreciation_change',
}

@Entity('market_alerts')
@Index(['organizationId', 'isRead'])
@Index(['userId', 'isRead'])
@Index(['zipCode', 'triggeredAt'])
export class MarketAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: MarketAlertType,
  })
  type!: MarketAlertType;

  @Column({ type: 'varchar', length: 10 })
  zipCode!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  threshold!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  currentValue!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  previousValue!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  change!: number; // Percentage or absolute

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn()
  triggeredAt!: Date;
}

