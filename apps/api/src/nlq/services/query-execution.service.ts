import { Injectable } from '@nestjs/common';
import {
  StructuredQuery,
  QueryResult,
  QueryIntent,
  EntityType,
} from '@real-estate-analyzer/types';
import { PropertyService } from '../../property/property.service';
import { DealService } from '../../deal/deal.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { ValuationService } from '../../valuation/valuation.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';
import { QueryBuilderService } from './query-builder.service';

@Injectable()
export class QueryExecutionService {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly analyticsService: AnalyticsService,
    private readonly valuationService: ValuationService,
    private readonly queryBuilder: QueryBuilderService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Execute a structured query
   */
  async executeQuery(
    structuredQuery: StructuredQuery,
    organizationId: string,
    originalQuery: string
  ): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      let results: any[] = [];
      let formattedResults = '';

      switch (structuredQuery.intent) {
        case QueryIntent.SEARCH:
        case QueryIntent.FIND:
        case QueryIntent.LIST:
        case QueryIntent.SHOW:
          results = await this.executeSearchQuery(structuredQuery, organizationId);
          formattedResults = this.formatSearchResults(results, structuredQuery);
          break;

        case QueryIntent.FILTER:
          results = await this.executeFilterQuery(structuredQuery, organizationId);
          formattedResults = this.formatFilterResults(results, structuredQuery);
          break;

        case QueryIntent.ANALYZE:
          results = await this.executeAnalyzeQuery(structuredQuery, organizationId);
          formattedResults = this.formatAnalyzeResults(results, structuredQuery);
          break;

        case QueryIntent.COMPARE:
          results = await this.executeCompareQuery(structuredQuery, organizationId);
          formattedResults = this.formatCompareResults(results, structuredQuery);
          break;

        case QueryIntent.CALCULATE:
          results = await this.executeCalculateQuery(structuredQuery, organizationId);
          formattedResults = this.formatCalculateResults(results, structuredQuery);
          break;

        default:
          results = await this.executeSearchQuery(structuredQuery, organizationId);
          formattedResults = this.formatSearchResults(results, structuredQuery);
      }

      const executionTime = Date.now() - startTime;

      return {
        query: originalQuery,
        structuredQuery,
        results,
        formattedResults,
        executionTime,
        resultCount: results.length,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        `Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'QueryExecutionService',
        { query: originalQuery.substring(0, 100), executionTime }
      );
      throw error;
    }
  }

  /**
   * Execute search/find/list/show queries
   */
  private async executeSearchQuery(
    query: StructuredQuery,
    organizationId: string
  ): Promise<any[]> {
    if (query.entity === EntityType.PROPERTY) {
      const properties = await this.propertyService.findAll(organizationId, false);
      return this.applyFilters(properties, query.filters, query.sort, query.limit);
    } else if (query.entity === EntityType.DEAL) {
      const deals = await this.dealService.findAll(organizationId);
      return this.applyFilters(deals, query.filters, query.sort, query.limit);
    } else {
      // Default to properties
      const properties = await this.propertyService.findAll(organizationId, false);
      return this.applyFilters(properties, query.filters, query.sort, query.limit);
    }
  }

  /**
   * Execute filter queries
   */
  private async executeFilterQuery(
    query: StructuredQuery,
    organizationId: string
  ): Promise<any[]> {
    return this.executeSearchQuery(query, organizationId);
  }

  /**
   * Execute analyze queries
   */
  private async executeAnalyzeQuery(
    query: StructuredQuery,
    organizationId: string
  ): Promise<any[]> {
    // Use analytics service for analysis
    const dashboard = await this.analyticsService.getDashboard({});
    const portfolioSummary = await this.analyticsService.getPortfolioSummary({});

    return [
      {
        type: 'analysis',
        dashboard,
        portfolioSummary,
      },
    ];
  }

  /**
   * Execute compare queries
   */
  private async executeCompareQuery(
    query: StructuredQuery,
    organizationId: string
  ): Promise<any[]> {
    // Get items to compare
    const items = await this.executeSearchQuery(query, organizationId);
    
    // Compare properties or deals
    if (query.entity === EntityType.PROPERTY && items.length >= 2) {
      return this.compareProperties(items.slice(0, 2));
    } else if (query.entity === EntityType.DEAL && items.length >= 2) {
      return this.compareDeals(items.slice(0, 2));
    }

    return items;
  }

  /**
   * Execute calculate queries
   */
  private async executeCalculateQuery(
    query: StructuredQuery,
    organizationId: string
  ): Promise<any[]> {
    // Extract metric to calculate
    const metricFilter = query.filters.find((f) => f.field === 'metric');
    const metric = metricFilter?.value || 'unknown';

    // Get relevant deals for calculation
    const deals = await this.dealService.findAll(organizationId);
    const filteredDeals = this.applyFilters(deals, query.filters, undefined, undefined);

    const calculations: any[] = [];

    for (const deal of filteredDeals) {
      const valuation = this.valuationService.calculateDealValuation(deal);
      
      if (metric.includes('cap rate') || metric.includes('caprate')) {
        calculations.push({
          dealId: deal.id,
          metric: 'Cap Rate',
          value: valuation.capRate?.rate || 0,
          unit: '%',
        });
      } else if (metric.includes('cash on cash') || metric.includes('coc')) {
        calculations.push({
          dealId: deal.id,
          metric: 'Cash-on-Cash Return',
          value: valuation.returnMetrics?.cashOnCashReturn || 0,
          unit: '%',
        });
      } else if (metric.includes('roi')) {
        calculations.push({
          dealId: deal.id,
          metric: 'ROI',
          value: valuation.returnMetrics?.roi || 0,
          unit: '%',
        });
      } else if (metric.includes('cash flow')) {
        calculations.push({
          dealId: deal.id,
          metric: 'Monthly Cash Flow',
          value: valuation.cashFlow?.monthlyCashFlow || 0,
          unit: '$',
        });
      }
    }

    return calculations;
  }

  /**
   * Apply filters, sorting, and limit to results
   */
  private applyFilters(
    items: any[],
    filters: any[],
    sort?: any,
    limit?: number
  ): any[] {
    let filtered = [...items];

    // Apply filters
    for (const filter of filters) {
      filtered = filtered.filter((item) => {
        const fieldValue = this.getFieldValue(item, filter.field);
        return this.matchesFilter(fieldValue, filter.operator, filter.value);
      });
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        const aValue = this.getFieldValue(a, sort.field);
        const bValue = this.getFieldValue(b, sort.field);
        
        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  /**
   * Get field value from object (supports nested fields)
   */
  private getFieldValue(obj: any, field: string): any {
    const parts = field.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  /**
   * Check if value matches filter
   */
  private matchesFilter(value: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case 'eq':
        return value === filterValue;
      case 'ne':
        return value !== filterValue;
      case 'gt':
        return Number(value) > Number(filterValue);
      case 'gte':
        return Number(value) >= Number(filterValue);
      case 'lt':
        return Number(value) < Number(filterValue);
      case 'lte':
        return Number(value) <= Number(filterValue);
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      case 'like':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase().replace(/%/g, ''));
      case 'between':
        return Array.isArray(filterValue) && 
               value >= filterValue[0] && 
               value <= filterValue[1];
      default:
        return true;
    }
  }

  /**
   * Compare properties
   */
  private compareProperties(properties: any[]): any[] {
    return properties.map((p) => ({
      id: p.id,
      address: p.address,
      city: p.city,
      state: p.state,
      purchasePrice: p.purchasePrice,
      currentValue: p.currentValue,
      propertyType: p.propertyType,
    }));
  }

  /**
   * Compare deals
   */
  private compareDeals(deals: any[]): any[] {
    return deals.map((d) => {
      const valuation = this.valuationService.calculateDealValuation(d);
      return {
        id: d.id,
        purchasePrice: d.purchasePrice,
        capRate: valuation.capRate?.rate,
        cashOnCashReturn: valuation.returnMetrics?.cashOnCashReturn,
        monthlyCashFlow: valuation.cashFlow?.monthlyCashFlow,
      };
    });
  }

  /**
   * Format search results
   */
  private formatSearchResults(results: any[], query: StructuredQuery): string {
    if (results.length === 0) {
      return 'No results found matching your query.';
    }

    if (query.entity === EntityType.PROPERTY) {
      return `Found ${results.length} properties:\n\n` +
        results.map((p, idx) => 
          `${idx + 1}. ${p.address}, ${p.city}, ${p.state} - $${p.purchasePrice?.toLocaleString() || 'N/A'}`
        ).join('\n');
    } else if (query.entity === EntityType.DEAL) {
      return `Found ${results.length} deals:\n\n` +
        results.map((d, idx) => 
          `${idx + 1}. Deal ${d.id.substring(0, 8)}... - $${d.purchasePrice?.toLocaleString() || 'N/A'}`
        ).join('\n');
    }

    return `Found ${results.length} results.`;
  }

  /**
   * Format filter results
   */
  private formatFilterResults(results: any[], query: StructuredQuery): string {
    return this.formatSearchResults(results, query);
  }

  /**
   * Format analyze results
   */
  private formatAnalyzeResults(results: any[], query: StructuredQuery): string {
    if (results.length === 0 || !results[0].portfolioSummary) {
      return 'Analysis completed. No data available.';
    }

    const summary = results[0].portfolioSummary;
    return `Portfolio Analysis:\n\n` +
      `Total Properties: ${summary.totalProperties}\n` +
      `Total Portfolio Value: $${summary.totalPortfolioValue?.toLocaleString() || '0'}\n` +
      `Average Cap Rate: ${summary.averageCapRate?.toFixed(2) || '0'}%\n` +
      `Total Monthly Cash Flow: $${summary.totalMonthlyCashFlow?.toLocaleString() || '0'}`;
  }

  /**
   * Format compare results
   */
  private formatCompareResults(results: any[], query: StructuredQuery): string {
    if (results.length < 2) {
      return 'Comparison requires at least 2 items.';
    }

    return `Comparison:\n\n` +
      results.map((item, idx) => 
        `${idx + 1}. ${JSON.stringify(item, null, 2)}`
      ).join('\n\n---\n\n');
  }

  /**
   * Format calculate results
   */
  private formatCalculateResults(results: any[], query: StructuredQuery): string {
    if (results.length === 0) {
      return 'No calculations available.';
    }

    return `Calculations:\n\n` +
      results.map((calc) => 
        `${calc.metric}: ${calc.value}${calc.unit}`
      ).join('\n');
  }
}

