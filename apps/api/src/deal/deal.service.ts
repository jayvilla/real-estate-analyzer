import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealEntity } from './entities/deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import {
  PropertyNotFoundException,
  DatabaseException,
  ResourceNotFoundException,
} from '../common/errors/custom-exceptions';
import { PropertyService } from '../property/property.service';
import { DealStatus } from '@real-estate-analyzer/types';
import { DealCreatedEvent } from '../events/deal-created.event';
import { DealUpdatedEvent } from '../events/deal-updated.event';
import { RequestContextService } from '../common/context/request-context.service';

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    private readonly propertyService: PropertyService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: StructuredLoggerService,
    private readonly requestContext: RequestContextService
  ) {}

  async create(createDealDto: CreateDealDto, organizationId: string): Promise<DealEntity> {
    const startTime = Date.now();

    try {
      // Verify property exists and get organizationId
      const property = await this.propertyService.findOne(createDealDto.propertyId, organizationId);

      this.logger.logWithMetadata(
        'info',
        `Creating deal for property ${createDealDto.propertyId}`,
        {
          propertyId: createDealDto.propertyId,
          organizationId,
          purchasePrice: createDealDto.purchasePrice,
          loanType: createDealDto.loanType,
        },
        DealService.name
      );

      // Calculate total acquisition cost if not provided
      const totalAcquisitionCost =
        createDealDto.purchasePrice +
        (createDealDto.closingCosts || 0) +
        (createDealDto.rehabCosts || 0);

      // Calculate down payment if not provided but downPaymentPercent is
      let downPayment = createDealDto.downPayment;
      if (!downPayment && createDealDto.downPaymentPercent) {
        downPayment =
          (createDealDto.purchasePrice * createDealDto.downPaymentPercent) /
          100;
      }

      // Calculate loan amount if not provided
      let loanAmount = createDealDto.loanAmount;
      if (!loanAmount && downPayment) {
        loanAmount = createDealDto.purchasePrice - downPayment;
      }

      const deal = this.dealRepository.create({
        ...createDealDto,
        purchaseDate: new Date(createDealDto.purchaseDate),
        totalAcquisitionCost,
        downPayment,
        loanAmount,
        status: createDealDto.status || DealStatus.DRAFT,
        organizationId,
      });

      const savedDeal = await this.dealRepository.save(deal);

      // Emit event for event-driven architecture
      const correlationId = this.requestContext.getCorrelationId();
      this.eventEmitter.emit(
        'deal.created',
        new DealCreatedEvent(savedDeal.id, savedDeal.propertyId, savedDeal, undefined, correlationId)
      );

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Deal created successfully with ID: ${savedDeal.id}`,
        {
          dealId: savedDeal.id,
          propertyId: savedDeal.propertyId,
          duration,
        },
        DealService.name
      );

      return savedDeal;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Re-throw custom exceptions as-is
      if (
        error instanceof PropertyNotFoundException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }

      // Wrap database errors
      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error creating deal: ${error.message}`,
          error.stack,
          DealService.name,
          {
            propertyId: createDealDto.propertyId,
            duration,
          }
        );
        throw new DatabaseException(error.message, error);
      }

      this.logger.error(
        `Failed to create deal: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        DealService.name,
        {
          metadata: {
            propertyId: createDealDto.propertyId,
            duration,
          },
        }
      );
      throw error;
    }
  }

  async findAll(organizationId: string): Promise<DealEntity[]> {
    try {
      return await this.dealRepository.find({
        where: { organizationId },
        relations: ['property'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }

      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error finding all deals: ${error.message}`,
          error.stack,
          DealService.name
        );
        throw new DatabaseException(error.message, error);
      }

      this.logger.error(
        `Failed to find all deals: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        DealService.name
      );
      throw error;
    }
  }

  async findByPropertyId(propertyId: string, organizationId: string): Promise<DealEntity[]> {
    try {
      return await this.dealRepository.find({
        where: { propertyId, organizationId },
        relations: ['property'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }

      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error finding deals by property: ${error.message}`,
          error.stack,
          DealService.name,
          { propertyId }
        );
        throw new DatabaseException(error.message, error);
      }

      this.logger.error(
        `Failed to find deals by property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        DealService.name,
        { metadata: { propertyId } }
      );
      throw error;
    }
  }

  async findOne(id: string, organizationId: string): Promise<DealEntity> {
    try {
      const deal = await this.dealRepository.findOne({
        where: { id, organizationId },
        relations: ['property'],
      });

      if (!deal) {
        this.logger.warn(
          `Deal not found with ID: ${id}`,
          DealService.name,
          { dealId: id }
        );
        throw new ResourceNotFoundException('Deal', id);
      }

      return deal;
    } catch (error) {
      // Re-throw custom exceptions as-is
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }

      // Wrap database errors
      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error finding deal: ${error.message}`,
          error.stack,
          DealService.name,
          { dealId: id }
        );
        throw new DatabaseException(error.message, error);
      }

      this.logger.error(
        `Failed to find deal: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        DealService.name,
        { metadata: { dealId: id } }
      );
      throw error;
    }
  }

  async update(id: string, updateDealDto: UpdateDealDto, organizationId: string): Promise<DealEntity> {
    const startTime = Date.now();

    try {
      const deal = await this.findOne(id, organizationId);

      // Recalculate total acquisition cost if purchase price or costs changed
      if (
        updateDealDto.purchasePrice !== undefined ||
        updateDealDto.closingCosts !== undefined ||
        updateDealDto.rehabCosts !== undefined
      ) {
        const purchasePrice =
          updateDealDto.purchasePrice ?? deal.purchasePrice;
        const closingCosts = updateDealDto.closingCosts ?? deal.closingCosts ?? 0;
        const rehabCosts = updateDealDto.rehabCosts ?? deal.rehabCosts ?? 0;
        updateDealDto.totalAcquisitionCost =
          purchasePrice + closingCosts + rehabCosts;
      }

      // Recalculate down payment if needed
      if (
        updateDealDto.downPaymentPercent !== undefined &&
        (updateDealDto.purchasePrice !== undefined ||
          deal.purchasePrice !== undefined)
      ) {
        const purchasePrice =
          updateDealDto.purchasePrice ?? deal.purchasePrice;
        updateDealDto.downPayment =
          (purchasePrice * updateDealDto.downPaymentPercent) / 100;
      }

      // Recalculate loan amount if needed
      if (
        updateDealDto.downPayment !== undefined &&
        (updateDealDto.purchasePrice !== undefined ||
          deal.purchasePrice !== undefined)
      ) {
        const purchasePrice =
          updateDealDto.purchasePrice ?? deal.purchasePrice;
        updateDealDto.loanAmount =
          purchasePrice - updateDealDto.downPayment;
      }

      // Handle date conversion
      if (updateDealDto.purchaseDate) {
        updateDealDto.purchaseDate = new Date(
          updateDealDto.purchaseDate
        ) as any;
      }

      // Store previous values for event
      const previousValues: Partial<DealEntity> = {
        purchasePrice: deal.purchasePrice,
        loanAmount: deal.loanAmount,
        interestRate: deal.interestRate,
        loanTerm: deal.loanTerm,
        monthlyRentalIncome: deal.monthlyRentalIncome,
        annualRentalIncome: deal.annualRentalIncome,
        monthlyExpenses: deal.monthlyExpenses,
        annualExpenses: deal.annualExpenses,
        vacancyRate: deal.vacancyRate,
        propertyManagementRate: deal.propertyManagementRate,
      };

      Object.assign(deal, updateDealDto);
      const updatedDeal = await this.dealRepository.save(deal);

      // Emit event for event-driven architecture
      const correlationId = this.requestContext.getCorrelationId();
      this.eventEmitter.emit(
        'deal.updated',
        new DealUpdatedEvent(updatedDeal.id, updatedDeal.propertyId, updatedDeal, previousValues, undefined, correlationId)
      );

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Deal updated successfully: ${updatedDeal.id}`,
        {
          dealId: updatedDeal.id,
          duration,
        },
        DealService.name
      );

      return updatedDeal;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Re-throw custom exceptions as-is
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }

      // Wrap database errors
      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error updating deal: ${error.message}`,
          error.stack,
          DealService.name,
          {
            dealId: id,
            duration,
          }
        );
        throw new DatabaseException(error.message, error);
      }

      this.logger.error(
        `Failed to update deal: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        DealService.name,
        {
          metadata: {
            dealId: id,
            duration,
          },
        }
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const startTime = Date.now();

    try {
      const deal = await this.findOne(id, organizationId);
      await this.dealRepository.remove(deal);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Deal deleted successfully: ${id}`,
        {
          dealId: id,
          duration,
        },
        DealService.name
      );
    } catch (error) {
      const duration = Date.now() - startTime;

      // Re-throw custom exceptions as-is
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }

      // Wrap database errors
      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error deleting deal: ${error.message}`,
          error.stack,
          DealService.name,
          {
            dealId: id,
            duration,
          }
        );
        throw new DatabaseException(error.message, error);
      }

      this.logger.error(
        `Failed to delete deal: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        DealService.name,
        {
          metadata: {
            dealId: id,
            duration,
          },
        }
      );
      throw error;
    }
  }
}

