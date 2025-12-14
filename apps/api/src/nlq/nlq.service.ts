import { Injectable } from '@nestjs/common';
import {
  QueryResult,
  StructuredQuery,
  QueryValidationResult,
} from '@real-estate-analyzer/types';
import { QueryBuilderService } from './services/query-builder.service';
import { QueryExecutionService } from './services/query-execution.service';
import { QueryHistoryService } from './services/query-history.service';
import { QueryValidationService } from './services/query-validation.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';

@Injectable()
export class NLQService {
  constructor(
    private readonly queryBuilder: QueryBuilderService,
    private readonly queryExecution: QueryExecutionService,
    private readonly queryHistory: QueryHistoryService,
    private readonly queryValidation: QueryValidationService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Process natural language query
   */
  async processQuery(
    query: string,
    userId: string,
    organizationId: string
  ): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      // Step 1: Build structured query
      const structuredQuery = await this.queryBuilder.buildQuery(query, organizationId);

      // Step 2: Validate query
      const validation = this.queryValidation.validateQuery(structuredQuery);
      if (!validation.valid) {
        throw new Error(`Query validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        this.logger.warn(
          `Query validation warnings: ${validation.warnings.join(', ')}`,
          'NLQService',
          { query: query.substring(0, 100) }
        );
      }

      // Step 3: Execute query
      const result = await this.queryExecution.executeQuery(
        structuredQuery,
        organizationId,
        query
      );

      // Step 4: Save to history
      await this.queryHistory.saveQuery(
        query,
        structuredQuery,
        result.resultCount,
        result.executionTime,
        userId,
        organizationId
      ).catch((error) => {
        // Don't fail the query if history save fails
        this.logger.warn(
          `Failed to save query history: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'NLQService'
        );
      });

      const totalTime = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Natural language query processed`,
        {
          query: query.substring(0, 100),
          intent: structuredQuery.intent,
          resultCount: result.resultCount,
          executionTime: result.executionTime,
          totalTime,
        },
        'NLQService'
      );

      return result;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      this.logger.error(
        `Failed to process natural language query: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'NLQService',
        { query: query.substring(0, 100), totalTime }
      );
      throw error;
    }
  }

  /**
   * Get query history
   */
  async getHistory(
    userId: string,
    organizationId: string,
    limit?: number
  ): Promise<any[]> {
    return this.queryHistory.getHistory(userId, organizationId, limit);
  }

  /**
   * Get query suggestions
   */
  async getSuggestions(
    organizationId: string,
    limit?: number
  ): Promise<any[]> {
    return this.queryHistory.getSuggestions(organizationId, limit);
  }
}

