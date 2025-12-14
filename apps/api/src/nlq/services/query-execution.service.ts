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

      // Check if this is a metric query (has aggregations or metric filter)
      const isMetricQuery = structuredQuery.aggregations && structuredQuery.aggregations.length > 0 ||
                           structuredQuery.filters.some(f => f.field === 'metric') ||
                           structuredQuery.entity === EntityType.METRIC;

      switch (structuredQuery.intent) {
        case QueryIntent.SEARCH:
        case QueryIntent.FIND:
        case QueryIntent.LIST:
        case QueryIntent.SHOW:
          // If it's a metric query, use analyze instead
          if (isMetricQuery) {
            results = await this.executeAnalyzeQuery(structuredQuery, organizationId);
            formattedResults = this.formatAnalyzeResults(results, structuredQuery);
          } else {
            results = await this.executeSearchQuery(structuredQuery, organizationId);
            formattedResults = this.formatSearchResults(results, structuredQuery);
          }
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
          // If it's a metric query, use analyze
          if (isMetricQuery) {
            results = await this.executeAnalyzeQuery(structuredQuery, organizationId);
            formattedResults = this.formatAnalyzeResults(results, structuredQuery);
          } else {
            results = await this.executeSearchQuery(structuredQuery, organizationId);
            formattedResults = this.formatSearchResults(results, structuredQuery);
          }
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
    // Check if this is a metric analysis query (max, min, avg, etc.)
    const lowerQuery = query.aggregations?.[0] || '';
    const hasMetric = query.filters.some(f => f.field === 'metric') || 
                     query.entity === EntityType.METRIC;
    
    if (hasMetric || query.aggregations) {
      // Get deals for metric calculation
      const deals = await this.dealService.findAll(organizationId);
      const filteredDeals = this.applyFilters(deals, query.filters, undefined, undefined);
      
      const calculations: any[] = [];
      
      for (const deal of filteredDeals) {
        const valuation = this.valuationService.calculateDealValuation(deal);
        const property = await this.propertyService.findOne(deal.propertyId, organizationId, false);
        
        // Determine which metric to calculate
        const metricFilter = query.filters.find(f => f.field === 'metric');
        const metricName = metricFilter?.value?.toLowerCase() || 
                          (query.entity === EntityType.METRIC ? 'cap rate' : 'cap rate');
        
        let metricValue: number | null = null;
        let metricLabel = '';
        
        if (metricName.includes('cap rate') || metricName.includes('caprate')) {
          metricValue = valuation.capRate?.rate || null;
          metricLabel = 'Cap Rate';
        } else if (metricName.includes('cash on cash') || metricName.includes('coc')) {
          metricValue = valuation.returnMetrics?.cashOnCashReturn || null;
          metricLabel = 'Cash-on-Cash Return';
        } else if (metricName.includes('roi')) {
          metricValue = valuation.returnMetrics?.roi || null;
          metricLabel = 'ROI';
        } else if (metricName.includes('cash flow')) {
          metricValue = valuation.cashFlow?.monthlyCashFlow || null;
          metricLabel = 'Monthly Cash Flow';
        } else {
          // Default to cap rate
          metricValue = valuation.capRate?.rate || null;
          metricLabel = 'Cap Rate';
        }
        
        if (metricValue !== null) {
          calculations.push({
            dealId: deal.id,
            propertyId: deal.propertyId,
            propertyAddress: property.address,
            city: property.city,
            state: property.state,
            metric: metricLabel,
            value: metricValue,
            unit: metricLabel.includes('Rate') || metricLabel.includes('ROI') ? '%' : '$',
          });
        }
      }
      
      // Apply aggregations if specified
      if (query.aggregations && calculations.length > 0) {
        const values = calculations.map(c => c.value).filter(v => v !== null) as number[];
        
        if (query.aggregations.includes('max') || query.aggregations.includes('maximum')) {
          const maxValue = Math.max(...values);
          const maxItem = calculations.find(c => c.value === maxValue);
          return [{
            type: 'aggregation',
            aggregation: 'max',
            metric: calculations[0].metric,
            value: maxValue,
            unit: calculations[0].unit,
            property: maxItem ? `${maxItem.propertyAddress}, ${maxItem.city}, ${maxItem.state}` : null,
            dealId: maxItem?.dealId || null,
          }];
        } else if (query.aggregations.includes('min') || query.aggregations.includes('minimum')) {
          const minValue = Math.min(...values);
          const minItem = calculations.find(c => c.value === minValue);
          return [{
            type: 'aggregation',
            aggregation: 'min',
            metric: calculations[0].metric,
            value: minValue,
            unit: calculations[0].unit,
            property: minItem ? `${minItem.propertyAddress}, ${minItem.city}, ${minItem.state}` : null,
            dealId: minItem?.dealId || null,
          }];
        } else if (query.aggregations.includes('avg') || query.aggregations.includes('average') || query.aggregations.includes('mean')) {
          const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
          return [{
            type: 'aggregation',
            aggregation: 'avg',
            metric: calculations[0].metric,
            value: avgValue,
            unit: calculations[0].unit,
            count: values.length,
          }];
        } else if (query.aggregations.includes('sum') || query.aggregations.includes('total')) {
          const sumValue = values.reduce((a, b) => a + b, 0);
          return [{
            type: 'aggregation',
            aggregation: 'sum',
            metric: calculations[0].metric,
            value: sumValue,
            unit: calculations[0].unit,
            count: values.length,
          }];
        }
      }
      
      return calculations;
    }
    
    // Use analytics service for general analysis
    const dashboard = await this.analyticsService.getDashboard({}, organizationId);
    const portfolioSummary = await this.analyticsService.getPortfolioSummary({}, organizationId);

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

    if (query.entity === EntityType.PROPERTY || results[0].address) {
      const propertyList = results.map((p, idx) => 
        `${idx + 1}. ${p.address}, ${p.city}, ${p.state} ${p.zipCode || ''} - $${typeof p.purchasePrice === 'number' ? p.purchasePrice.toLocaleString() : parseFloat(p.purchasePrice || '0').toLocaleString()}`
      ).join('\n');
      
      return `Found ${results.length} ${results.length === 1 ? 'property' : 'properties'}:\n\n${propertyList}`;
    } else if (query.entity === EntityType.DEAL || results[0].propertyId) {
      return `Found ${results.length} ${results.length === 1 ? 'deal' : 'deals'}:\n\n` +
        results.map((d, idx) => 
          `${idx + 1}. Deal ${d.id.substring(0, 8)}... - $${typeof d.purchasePrice === 'number' ? d.purchasePrice.toLocaleString() : parseFloat(d.purchasePrice || '0').toLocaleString()}`
        ).join('\n');
    }

    return `Found ${results.length} ${results.length === 1 ? 'result' : 'results'}.`;
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
    if (results.length === 0) {
      return 'Analysis completed. No data available.';
    }

    // Check if this is a metric aggregation result
    if (results[0].type === 'aggregation') {
      const result = results[0];
      const aggregationLabel = result.aggregation === 'max' ? 'Maximum' :
                               result.aggregation === 'min' ? 'Minimum' :
                               result.aggregation === 'avg' ? 'Average' :
                               result.aggregation === 'sum' ? 'Total' : result.aggregation;
      
      let response = `${aggregationLabel} ${result.metric}: ${result.value.toFixed(2)}${result.unit}`;
      
      if (result.property) {
        response += `\n\nProperty: ${result.property}`;
      }
      
      if (result.count) {
        response += `\n\nBased on ${result.count} ${result.count === 1 ? 'deal' : 'deals'}`;
      }
      
      return response;
    }

    // Check if this is a list of calculations
    if (results[0].metric && results[0].value !== undefined) {
      const metricName = results[0].metric;
      const aggregation = query.aggregations?.[0] || '';
      
      if (aggregation === 'max' || aggregation === 'maximum') {
        const maxResult = results.reduce((max, r) => r.value > max.value ? r : max, results[0]);
        return `Maximum ${metricName}: ${maxResult.value.toFixed(2)}${maxResult.unit}\n\nProperty: ${maxResult.propertyAddress}, ${maxResult.city}, ${maxResult.state}`;
      } else if (aggregation === 'min' || aggregation === 'minimum') {
        const minResult = results.reduce((min, r) => r.value < min.value ? r : min, results[0]);
        return `Minimum ${metricName}: ${minResult.value.toFixed(2)}${minResult.unit}\n\nProperty: ${minResult.propertyAddress}, ${minResult.city}, ${minResult.state}`;
      } else if (aggregation === 'avg' || aggregation === 'average') {
        const avgValue = results.reduce((sum, r) => sum + r.value, 0) / results.length;
        return `Average ${metricName}: ${avgValue.toFixed(2)}${results[0].unit}\n\nBased on ${results.length} ${results.length === 1 ? 'deal' : 'deals'}`;
      }
      
      // Return top results
      const sorted = [...results].sort((a, b) => b.value - a.value);
      return `${metricName} Results:\n\n` +
        sorted.slice(0, 10).map((r, idx) => 
          `${idx + 1}. ${r.propertyAddress}, ${r.city}, ${r.state}: ${r.value.toFixed(2)}${r.unit}`
        ).join('\n');
    }

    // General portfolio analysis
    if (results[0].portfolioSummary) {
      const summary = results[0].portfolioSummary;
      return `Portfolio Analysis:\n\n` +
        `Total Properties: ${summary.totalProperties}\n` +
        `Total Portfolio Value: $${summary.totalPortfolioValue?.toLocaleString() || '0'}\n` +
        `Average Cap Rate: ${summary.averageCapRate?.toFixed(2) || '0'}%\n` +
        `Total Monthly Cash Flow: $${summary.totalMonthlyCashFlow?.toLocaleString() || '0'}`;
    }

    return 'Analysis completed.';
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

