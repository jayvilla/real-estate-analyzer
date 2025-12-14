import { Injectable } from '@nestjs/common';
import { ExtractedEntity, EntityType } from '@real-estate-analyzer/types';
import { PropertyService } from '../../property/property.service';
import { DealService } from '../../deal/deal.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class EntityExtractionService {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Extract and resolve entities from query
   */
  async extractEntities(
    entities: ExtractedEntity[],
    organizationId: string
  ): Promise<Map<EntityType, any[]>> {
    const resolved = new Map<EntityType, any[]>();

    for (const entity of entities) {
      try {
        switch (entity.type) {
          case EntityType.PROPERTY:
            await this.resolveProperties(entity, organizationId, resolved);
            break;
          case EntityType.DEAL:
            await this.resolveDeals(entity, organizationId, resolved);
            break;
          case EntityType.LOCATION:
            this.resolveLocation(entity, resolved);
            break;
          case EntityType.DATE:
            this.resolveDate(entity, resolved);
            break;
          case EntityType.NUMBER:
            this.resolveNumber(entity, resolved);
            break;
          case EntityType.STATUS:
            this.resolveStatus(entity, resolved);
            break;
          case EntityType.METRIC:
            this.resolveMetric(entity, resolved);
            break;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to resolve entity: ${entity.type} = ${entity.value}`,
          'EntityExtractionService'
        );
      }
    }

    return resolved;
  }

  private async resolveProperties(
    entity: ExtractedEntity,
    organizationId: string,
    resolved: Map<EntityType, any[]>
  ): Promise<void> {
    const properties = await this.propertyService.findAll(organizationId, false);
    
    // Try to match by address, city, or ID
    const matches = properties.filter((p) => {
      const searchValue = entity.value.toLowerCase();
      return (
        p.address.toLowerCase().includes(searchValue) ||
        p.city.toLowerCase().includes(searchValue) ||
        p.id === entity.value
      );
    });

    if (matches.length > 0) {
      if (!resolved.has(EntityType.PROPERTY)) {
        resolved.set(EntityType.PROPERTY, []);
      }
      resolved.get(EntityType.PROPERTY)!.push(...matches);
    }
  }

  private async resolveDeals(
    entity: ExtractedEntity,
    organizationId: string,
    resolved: Map<EntityType, any[]>
  ): Promise<void> {
    const deals = await this.dealService.findAll(organizationId);
    
    // Try to match by ID or property reference
    const matches = deals.filter((d) => {
      const searchValue = entity.value.toLowerCase();
      return (
        d.id === entity.value ||
        d.propertyId === entity.value
      );
    });

    if (matches.length > 0) {
      if (!resolved.has(EntityType.DEAL)) {
        resolved.set(EntityType.DEAL, []);
      }
      resolved.get(EntityType.DEAL)!.push(...matches);
    }
  }

  private resolveLocation(
    entity: ExtractedEntity,
    resolved: Map<EntityType, any[]>
  ): void {
    if (!resolved.has(EntityType.LOCATION)) {
      resolved.set(EntityType.LOCATION, []);
    }
    resolved.get(EntityType.LOCATION)!.push({
      value: entity.value,
      originalText: entity.originalText,
    });
  }

  private resolveDate(
    entity: ExtractedEntity,
    resolved: Map<EntityType, any[]>
  ): void {
    if (!resolved.has(EntityType.DATE)) {
      resolved.set(EntityType.DATE, []);
    }
    
    // Try to parse date
    const date = this.parseDate(entity.value);
    if (date) {
      resolved.get(EntityType.DATE)!.push({
        value: date,
        originalText: entity.originalText,
      });
    }
  }

  private resolveNumber(
    entity: ExtractedEntity,
    resolved: Map<EntityType, any[]>
  ): void {
    if (!resolved.has(EntityType.NUMBER)) {
      resolved.set(EntityType.NUMBER, []);
    }
    
    const num = parseFloat(entity.value);
    if (!isNaN(num)) {
      resolved.get(EntityType.NUMBER)!.push({
        value: num,
        originalText: entity.originalText,
      });
    }
  }

  private resolveStatus(
    entity: ExtractedEntity,
    resolved: Map<EntityType, any[]>
  ): void {
    if (!resolved.has(EntityType.STATUS)) {
      resolved.set(EntityType.STATUS, []);
    }
    
    const status = entity.value.toUpperCase();
    resolved.get(EntityType.STATUS)!.push({
      value: status,
      originalText: entity.originalText,
    });
  }

  private resolveMetric(
    entity: ExtractedEntity,
    resolved: Map<EntityType, any[]>
  ): void {
    if (!resolved.has(EntityType.METRIC)) {
      resolved.set(EntityType.METRIC, []);
    }
    
    const metric = entity.value.toLowerCase();
    resolved.get(EntityType.METRIC)!.push({
      value: metric,
      originalText: entity.originalText,
    });
  }

  private parseDate(value: string): Date | null {
    // Try various date formats
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
    ];

    for (const format of formats) {
      const match = value.match(format);
      if (match) {
        try {
          return new Date(value);
        } catch {
          continue;
        }
      }
    }

    // Try relative dates
    const lower = value.toLowerCase();
    if (lower.includes('today')) return new Date();
    if (lower.includes('yesterday')) {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }
    if (lower.includes('last week')) {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date;
    }
    if (lower.includes('last month')) {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date;
    }

    return null;
  }
}

