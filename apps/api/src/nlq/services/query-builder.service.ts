import { Injectable } from '@nestjs/common';
import {
  StructuredQuery,
  QueryIntent,
  QueryFilter,
  QuerySort,
  EntityType,
  ExtractedEntity,
} from '@real-estate-analyzer/types';
import { IntentRecognitionService } from './intent-recognition.service';
import { EntityExtractionService } from './entity-extraction.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class QueryBuilderService {
  constructor(
    private readonly intentRecognition: IntentRecognitionService,
    private readonly entityExtraction: EntityExtractionService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Build structured query from natural language
   */
  async buildQuery(
    query: string,
    organizationId: string
  ): Promise<StructuredQuery> {
    const startTime = Date.now();

    try {
      // Step 1: Recognize intent
      const intentResult = await this.intentRecognition.recognizeIntent(query);

      // Step 2: Extract and resolve entities
      const resolvedEntities = await this.entityExtraction.extractEntities(
        intentResult.entities,
        organizationId
      );

      // Step 3: Build structured query
      const structuredQuery = this.buildStructuredQuery(
        intentResult,
        resolvedEntities,
        query
      );

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Query built successfully`,
        {
          query: query.substring(0, 100),
          intent: structuredQuery.intent,
          filterCount: structuredQuery.filters.length,
          duration,
        },
        'QueryBuilderService'
      );

      return structuredQuery;
    } catch (error) {
      this.logger.error(
        `Failed to build query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'QueryBuilderService',
        { query: query.substring(0, 100) }
      );
      throw error;
    }
  }

  /**
   * Build structured query from intent result and resolved entities
   */
  private buildStructuredQuery(
    intentResult: any,
    resolvedEntities: Map<EntityType, any[]>,
    originalQuery: string
  ): StructuredQuery {
    const query: StructuredQuery = {
      intent: intentResult.intent,
      entity: this.determineEntity(resolvedEntities),
      filters: [],
      limit: 50, // Default limit
    };

    // Build filters from entities and parameters
    this.buildFilters(query, intentResult, resolvedEntities, originalQuery);

    // Add sorting if specified
    this.buildSorting(query, intentResult, originalQuery);

    // Add aggregations for analyze intent
    if (query.intent === QueryIntent.ANALYZE) {
      query.aggregations = this.extractAggregations(originalQuery);
    }

    return query;
  }

  /**
   * Determine primary entity type
   */
  private determineEntity(resolvedEntities: Map<EntityType, any[]>): EntityType | null {
    // Priority: property > deal > metric
    if (resolvedEntities.has(EntityType.PROPERTY)) {
      return EntityType.PROPERTY;
    }
    if (resolvedEntities.has(EntityType.DEAL)) {
      return EntityType.DEAL;
    }
    if (resolvedEntities.has(EntityType.METRIC)) {
      return EntityType.METRIC;
    }
    return null;
  }

  /**
   * Build filters from entities and parameters
   */
  private buildFilters(
    query: StructuredQuery,
    intentResult: any,
    resolvedEntities: Map<EntityType, any[]>,
    originalQuery: string
  ): void {
    // Filter by property IDs if found
    if (resolvedEntities.has(EntityType.PROPERTY)) {
      const properties = resolvedEntities.get(EntityType.PROPERTY)!;
      if (properties.length > 0) {
        query.filters.push({
          field: 'propertyId',
          operator: 'in',
          value: properties.map((p) => p.id),
        });
      }
    }

    // Filter by deal IDs if found
    if (resolvedEntities.has(EntityType.DEAL)) {
      const deals = resolvedEntities.get(EntityType.DEAL)!;
      if (deals.length > 0) {
        query.filters.push({
          field: 'dealId',
          operator: 'in',
          value: deals.map((d) => d.id),
        });
      }
    }

    // Filter by location
    if (resolvedEntities.has(EntityType.LOCATION)) {
      const locations = resolvedEntities.get(EntityType.LOCATION)!;
      locations.forEach((loc) => {
        // Try to match city, state, or zipCode
        const lowerValue = loc.value.toLowerCase();
        if (lowerValue.match(/^\d{5}$/)) {
          // Zip code
          query.filters.push({
            field: 'zipCode',
            operator: 'eq',
            value: loc.value,
          });
        } else {
          // City or state
          query.filters.push({
            field: 'city',
            operator: 'like',
            value: `%${loc.value}%`,
          });
        }
      });
    }

    // Filter by status
    if (resolvedEntities.has(EntityType.STATUS)) {
      const statuses = resolvedEntities.get(EntityType.STATUS)!;
      query.filters.push({
        field: 'status',
        operator: 'in',
        value: statuses.map((s) => s.value),
      });
    }

    // Filter by date range
    if (resolvedEntities.has(EntityType.DATE)) {
      const dates = resolvedEntities.get(EntityType.DATE)!;
      if (dates.length >= 2) {
        query.filters.push({
          field: 'createdAt',
          operator: 'between',
          value: [dates[0].value, dates[1].value],
        });
      } else if (dates.length === 1) {
        query.filters.push({
          field: 'createdAt',
          operator: 'gte',
          value: dates[0].value,
        });
      }
    }

    // Filter by numeric values (price, etc.)
    if (resolvedEntities.has(EntityType.NUMBER)) {
      const numbers = resolvedEntities.get(EntityType.NUMBER)!;
      const lowerQuery = originalQuery.toLowerCase();
      
      numbers.forEach((num) => {
        if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
          query.filters.push({
            field: 'purchasePrice',
            operator: this.extractNumericOperator(originalQuery, num.originalText),
            value: num.value,
          });
        } else if (lowerQuery.includes('cap rate') || lowerQuery.includes('caprate')) {
          // This would need to be calculated, so we'll skip for now
        }
      });
    }

    // Add filters from parameters
    if (intentResult.parameters) {
      Object.entries(intentResult.parameters).forEach(([field, value]) => {
        if (field !== 'operator' && field !== 'value') {
          query.filters.push({
            field,
            operator: intentResult.parameters.operator || 'eq',
            value,
          });
        }
      });
    }
  }

  /**
   * Build sorting from query
   */
  private buildSorting(
    query: StructuredQuery,
    intentResult: any,
    originalQuery: string
  ): void {
    const lowerQuery = originalQuery.toLowerCase();

    // Check for sort indicators
    if (lowerQuery.includes('highest') || lowerQuery.includes('most') || lowerQuery.includes('top')) {
      query.sort = {
        field: this.extractSortField(originalQuery),
        direction: 'desc',
      };
    } else if (lowerQuery.includes('lowest') || lowerQuery.includes('least') || lowerQuery.includes('bottom')) {
      query.sort = {
        field: this.extractSortField(originalQuery),
        direction: 'asc',
      };
    } else if (lowerQuery.includes('sort by') || lowerQuery.includes('order by')) {
      const field = this.extractSortField(originalQuery);
      if (field) {
        query.sort = {
          field,
          direction: lowerQuery.includes('desc') ? 'desc' : 'asc',
        };
      }
    }
  }

  /**
   * Extract sort field from query
   */
  private extractSortField(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('price') || lowerQuery.includes('cost')) return 'purchasePrice';
    if (lowerQuery.includes('cap rate') || lowerQuery.includes('caprate')) return 'capRate';
    if (lowerQuery.includes('cash flow')) return 'monthlyCashFlow';
    if (lowerQuery.includes('roi') || lowerQuery.includes('return')) return 'roi';
    if (lowerQuery.includes('date') || lowerQuery.includes('created')) return 'createdAt';
    if (lowerQuery.includes('score')) return 'score';
    
    return 'createdAt'; // Default
  }

  /**
   * Extract numeric operator from query
   */
  private extractNumericOperator(query: string, numberText: string): QueryFilter['operator'] {
    const lowerQuery = query.toLowerCase();
    const numberIndex = query.toLowerCase().indexOf(numberText.toLowerCase());
    const context = query.substring(Math.max(0, numberIndex - 20), numberIndex + 20).toLowerCase();

    if (context.includes('greater than') || context.includes('more than') || context.includes('above') || context.includes('over')) {
      return 'gt';
    }
    if (context.includes('less than') || context.includes('below') || context.includes('under')) {
      return 'lt';
    }
    if (context.includes('at least') || context.includes('minimum')) {
      return 'gte';
    }
    if (context.includes('at most') || context.includes('maximum')) {
      return 'lte';
    }
    if (context.includes('between')) {
      return 'between';
    }

    return 'eq'; // Default to equals
  }

  /**
   * Extract aggregations from query
   */
  private extractAggregations(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const aggregations: string[] = [];

    if (lowerQuery.includes('average') || lowerQuery.includes('avg') || lowerQuery.includes('mean')) {
      aggregations.push('avg');
    }
    if (lowerQuery.includes('sum') || lowerQuery.includes('total')) {
      aggregations.push('sum');
    }
    if (lowerQuery.includes('count') || lowerQuery.includes('number of')) {
      aggregations.push('count');
    }
    if (lowerQuery.includes('min') || lowerQuery.includes('minimum')) {
      aggregations.push('min');
    }
    if (lowerQuery.includes('max') || lowerQuery.includes('maximum')) {
      aggregations.push('max');
    }

    return aggregations.length > 0 ? aggregations : ['count'];
  }
}

