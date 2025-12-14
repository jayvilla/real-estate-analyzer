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

    // Add aggregations for analyze intent or if metric entities are present
    if (query.intent === QueryIntent.ANALYZE || resolvedEntities.has(EntityType.METRIC)) {
      query.aggregations = this.extractAggregations(originalQuery);
      
      // If we have a metric entity, add it as a filter for easier access
      if (resolvedEntities.has(EntityType.METRIC)) {
        const metrics = resolvedEntities.get(EntityType.METRIC)!;
        if (metrics.length > 0) {
          query.filters.push({
            field: 'metric',
            operator: 'eq',
            value: metrics[0].value,
          });
        }
      }
    }

    return query;
  }

  /**
   * Determine primary entity type
   */
  private determineEntity(resolvedEntities: Map<EntityType, any[]>): EntityType | null {
    // If we have a metric entity, default to DEAL since metrics are calculated on deals
    if (resolvedEntities.has(EntityType.METRIC)) {
      // But if we also have property entities, prefer property
      if (resolvedEntities.has(EntityType.PROPERTY)) {
        return EntityType.PROPERTY;
      }
      // For metric queries, we need deals to calculate metrics
      return EntityType.DEAL;
    }
    
    // Priority: property > deal
    if (resolvedEntities.has(EntityType.PROPERTY)) {
      return EntityType.PROPERTY;
    }
    if (resolvedEntities.has(EntityType.DEAL)) {
      return EntityType.DEAL;
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
      const usStates = [
        'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware',
        'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky',
        'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri',
        'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina',
        'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina',
        'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
        'wisconsin', 'wyoming'
      ];
      const stateAbbreviations: Record<string, string> = {
        'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california', 'co': 'colorado',
        'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia', 'hi': 'hawaii', 'id': 'idaho',
        'il': 'illinois', 'in': 'indiana', 'ia': 'iowa', 'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana',
        'me': 'maine', 'md': 'maryland', 'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
        'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'new hampshire', 'nj': 'new jersey',
        'nm': 'new mexico', 'ny': 'new york', 'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio', 'ok': 'oklahoma',
        'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina', 'sd': 'south dakota',
        'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah', 'vt': 'vermont', 'va': 'virginia', 'wa': 'washington',
        'wv': 'west virginia', 'wi': 'wisconsin', 'wy': 'wyoming'
      };
      
      locations.forEach((loc) => {
        const lowerValue = loc.value.toLowerCase();
        
        // Check if it's a zip code
        if (lowerValue.match(/^\d{5}$/)) {
          query.filters.push({
            field: 'zipCode',
            operator: 'eq',
            value: loc.value,
          });
        } 
        // Check if it's a state abbreviation (2 letters)
        else if (loc.value.length === 2 && stateAbbreviations[lowerValue]) {
          query.filters.push({
            field: 'state',
            operator: 'eq',
            value: loc.value.toUpperCase(),
          });
        }
        // Check if it's a full state name
        else if (usStates.includes(lowerValue)) {
          // Map state name to abbreviation
          const stateMap: Record<string, string> = {
            'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA', 'colorado': 'CO',
            'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
            'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA',
            'maine': 'ME', 'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
            'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
            'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
            'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
            'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
            'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
          };
          const stateAbbr = stateMap[lowerValue];
          if (stateAbbr) {
            query.filters.push({
              field: 'state',
              operator: 'eq',
              value: stateAbbr,
            });
          }
        } 
        // Otherwise assume it's a city
        else {
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

