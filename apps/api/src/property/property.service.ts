import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PropertyEntity } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyCreatedEvent } from '../events/property-created.event';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: Repository<PropertyEntity>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<PropertyEntity> {
    this.logger.log(`Creating property at ${createPropertyDto.address}`);

    const property = this.propertyRepository.create(createPropertyDto);
    const savedProperty = await this.propertyRepository.save(property);

    // Emit event for event-driven architecture
    this.eventEmitter.emit(
      'property.created',
      new PropertyCreatedEvent(savedProperty.id, savedProperty)
    );

    this.logger.log(`Property created with ID: ${savedProperty.id}`);
    return savedProperty;
  }

  async findAll(): Promise<PropertyEntity[]> {
    this.logger.log('Finding all properties');
    return this.propertyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PropertyEntity> {
    this.logger.log(`Finding property with ID: ${id}`);
    const property = await this.propertyRepository.findOne({ where: { id } });

    if (!property) {
      this.logger.warn(`Property not found with ID: ${id}`);
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto
  ): Promise<PropertyEntity> {
    this.logger.log(`Updating property with ID: ${id}`);

    const property = await this.findOne(id);
    Object.assign(property, updatePropertyDto);

    const updatedProperty = await this.propertyRepository.save(property);
    this.logger.log(`Property updated with ID: ${id}`);

    return updatedProperty;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing property with ID: ${id}`);
    const property = await this.findOne(id);
    await this.propertyRepository.remove(property);
    this.logger.log(`Property removed with ID: ${id}`);
  }
}
