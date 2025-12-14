import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('market_data')
@Index(['zipCode', 'date'])
@Index(['city', 'state', 'date'])
export class MarketDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 10 })
  zipCode!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 50 })
  state!: string;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  medianPrice?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  averagePrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerSquareFoot?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  medianRent?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageRent?: number;

  @Column({ type: 'int', nullable: true })
  daysOnMarket?: number;

  @Column({ type: 'int', nullable: true })
  inventoryCount?: number;

  @Column({ type: 'int', nullable: true })
  salesCount?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  appreciationRate?: number; // Annual percentage

  @Column({ type: 'varchar', length: 50, nullable: true })
  source?: string; // e.g., 'api', 'manual', 'calculated'

  @CreateDateColumn()
  createdAt!: Date;
}

