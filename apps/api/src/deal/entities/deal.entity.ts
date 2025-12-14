import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropertyEntity } from '../../property/entities/property.entity';
import { OrganizationEntity } from '../../organization/entities/organization.entity';
import { LoanType, DealStatus } from '@real-estate-analyzer/types';

@Entity('deals')
export class DealEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  propertyId!: string;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: OrganizationEntity;

  @ManyToOne(() => PropertyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property!: PropertyEntity;

  // Purchase Details
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  purchasePrice!: number;

  @Column({ type: 'date' })
  purchaseDate!: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  closingCosts?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  rehabCosts?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalAcquisitionCost?: number;

  // Financing Details
  @Column({
    type: 'enum',
    enum: LoanType,
  })
  loanType!: LoanType;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  loanAmount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  downPayment?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  downPaymentPercent?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate?: number;

  @Column({ type: 'int', nullable: true })
  loanTerm?: number; // in months

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  points?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  originationFee?: number;

  // Assumptions
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyRentalIncome?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  annualRentalIncome?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyExpenses?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  annualExpenses?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  vacancyRate?: number; // percentage (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  propertyManagementRate?: number; // percentage (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  annualAppreciationRate?: number; // percentage (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  annualInflationRate?: number; // percentage (0-100)

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  capExReserve?: number; // monthly reserve for capital expenditures

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  insurance?: number; // monthly insurance cost

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  propertyTax?: number; // monthly property tax

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  hoaFees?: number; // monthly HOA fees

  // Status
  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.DRAFT,
  })
  status!: DealStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

