import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropertyType } from '@real-estate-analyzer/types';
import { DealEntity } from '../../deal/entities/deal.entity';
import { OrganizationEntity } from '../../organization/entities/organization.entity';

@Entity('properties')
export class PropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 50 })
  state!: string;

  @Column({ type: 'varchar', length: 20 })
  zipCode!: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
  })
  propertyType: PropertyType;

  @Column({ type: 'int', nullable: true })
  bedrooms?: number;

  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  squareFeet?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lotSize?: number;

  @Column({ type: 'int', nullable: true })
  yearBuilt?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  purchasePrice?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  currentValue?: number;

  @Column({ type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: OrganizationEntity;

  @OneToMany(() => DealEntity, (deal) => deal.property)
  deals?: DealEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
