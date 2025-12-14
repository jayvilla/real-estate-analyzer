import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PropertyEntity } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyCreatedEvent } from '../events/property-created.event';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { PropertyNotFoundException, DatabaseException } from '../common/errors/custom-exceptions';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: Repository<PropertyEntity>,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: StructuredLoggerService
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<PropertyEntity> {
    const startTime = Date.now();
    
    this.logger.log(
      `Creating property at ${createPropertyDto.address}`,
      'PropertyService',
      {
        metadata: {
          address: createPropertyDto.address,
          city: createPropertyDto.city,
          propertyType: createPropertyDto.propertyType,
        },
      }
    );

    try {
      const property = this.propertyRepository.create(createPropertyDto);
      const savedProperty = await this.propertyRepository.save(property);
      const duration = Date.now() - startTime;

      // Emit event for event-driven architecture
      this.eventEmitter.emit(
        'property.created',
        new PropertyCreatedEvent(savedProperty.id, savedProperty)
      );

      this.logger.logWithMetadata(
        'info',
        `Property created successfully`,
        {
          propertyId: savedProperty.id,
          address: savedProperty.address,
          duration,
        },
        'PropertyService'
      );

      return savedProperty;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Re-throw custom exceptions as-is
      if (error instanceof PropertyNotFoundException || error instanceof DatabaseException) {
        throw error;
      }

      // Wrap database errors in DatabaseException
      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error creating property: ${error.message}`,
          error.stack,
          'PropertyService',
          {
            metadata: {
              address: createPropertyDto.address,
              duration,
            },
          }
        );
        throw new DatabaseException(error.message, error);
      }

      // Log and re-throw other errors
      this.logger.error(
        `Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'PropertyService',
        {
          metadata: {
            address: createPropertyDto.address,
            duration,
          },
        }
      );
      throw error;
    }
  }

  async findAll(includeDeals = false): Promise<PropertyEntity[]> {
    const startTime = Date.now();
    
    this.logger.debug('Finding all properties', 'PropertyService');

    try {
      const properties = await this.propertyRepository.find({
        relations: includeDeals ? ['deals'] : [],
        order: { createdAt: 'DESC' },
      });
      const duration = Date.now() - startTime;

      this.logger.logWithMetadata(
        'info',
        `Retrieved ${properties.length} properties`,
        {
          count: properties.length,
          duration,
        },
        'PropertyService'
      );

      return properties;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to find properties: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'PropertyService',
        { metadata: { duration } }
      );
      throw error;
    }
  }

  async findOne(id: string, includeDeals = false): Promise<PropertyEntity> {
    this.logger.debug(`Finding property with ID: ${id}`, 'PropertyService');

    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
        relations: includeDeals ? ['deals'] : [],
      });

      if (!property) {
        this.logger.warn(
          `Property not found with ID: ${id}`,
          'PropertyService',
          { metadata: { propertyId: id } }
        );
        throw new PropertyNotFoundException(id);
      }

      return property;
    } catch (error) {
      // Re-throw custom exceptions as-is
      if (error instanceof PropertyNotFoundException || error instanceof DatabaseException) {
        throw error;
      }

      // Wrap database errors
      if (error instanceof Error && error.name.includes('QueryFailedError')) {
        this.logger.error(
          `Database error finding property: ${error.message}`,
          error.stack,
          'PropertyService',
          { metadata: { propertyId: id } }
        );
        throw new DatabaseException(error.message, error);
      }

      this.logger.error(
        `Failed to find property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'PropertyService',
        { metadata: { propertyId: id } }
      );
      throw error;
    }
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto
  ): Promise<PropertyEntity> {
    const startTime = Date.now();
    
    this.logger.log(
      `Updating property with ID: ${id}`,
      'PropertyService',
      { metadata: { propertyId: id } }
    );

    try {
      const property = await this.findOne(id);
      Object.assign(property, updatePropertyDto);

      const updatedProperty = await this.propertyRepository.save(property);
      const duration = Date.now() - startTime;

      this.logger.logWithMetadata(
        'info',
        `Property updated successfully`,
        {
          propertyId: id,
          duration,
        },
        'PropertyService'
      );

      return updatedProperty;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to update property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'PropertyService',
        {
          metadata: {
            propertyId: id,
            duration,
          },
        }
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const startTime = Date.now();
    
    this.logger.log(
      `Removing property with ID: ${id}`,
      'PropertyService',
      { metadata: { propertyId: id } }
    );

    try {
      const property = await this.findOne(id);
      await this.propertyRepository.remove(property);
      const duration = Date.now() - startTime;

      this.logger.logWithMetadata(
        'info',
        `Property removed successfully`,
        {
          propertyId: id,
          duration,
        },
        'PropertyService'
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to remove property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'PropertyService',
        {
          metadata: {
            propertyId: id,
            duration,
          },
        }
      );
      throw error;
    }
  }
}
