import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
    private readonly logger: StructuredLoggerService
  ) {}

  async create(name: string): Promise<OrganizationEntity> {
    const slug = this.generateSlug(name);
    
    const organization = this.organizationRepository.create({
      name,
      slug,
    });

    const saved = await this.organizationRepository.save(organization);

    this.logger.logWithMetadata(
      'info',
      `Created organization: ${saved.id}`,
      { organizationId: saved.id, name, slug },
      'OrganizationService'
    );

    return saved;
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    return this.organizationRepository.findOne({ where: { slug } });
  }

  async findByIdOrFail(id: string): Promise<OrganizationEntity> {
    const organization = await this.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

