import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryHistoryEntity } from '../entities/query-history.entity';
import {
  QueryHistory,
  QuerySuggestion,
  StructuredQuery,
} from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class QueryHistoryService {
  constructor(
    @InjectRepository(QueryHistoryEntity)
    private readonly historyRepository: Repository<QueryHistoryEntity>,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Save query to history
   */
  async saveQuery(
    query: string,
    structuredQuery: StructuredQuery,
    resultCount: number,
    executionTime: number,
    userId: string,
    organizationId: string
  ): Promise<QueryHistory> {
    try {
      const history = this.historyRepository.create({
        query,
        structuredQuery: structuredQuery as any,
        resultCount,
        executionTime,
        userId,
        organizationId,
      });

      const saved = await this.historyRepository.save(history);

      this.logger.logWithMetadata(
        'info',
        `Query saved to history`,
        {
          queryId: saved.id,
          userId,
          query: query.substring(0, 100),
        },
        'QueryHistoryService'
      );

      return this.entityToDto(saved);
    } catch (error) {
      this.logger.error(
        `Failed to save query history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'QueryHistoryService'
      );
      throw error;
    }
  }

  /**
   * Get query history for user
   */
  async getHistory(
    userId: string,
    organizationId: string,
    limit: number = 50
  ): Promise<QueryHistory[]> {
    try {
      const histories = await this.historyRepository.find({
        where: { userId, organizationId },
        order: { timestamp: 'DESC' },
        take: limit,
      });

      return histories.map((h) => this.entityToDto(h));
    } catch (error) {
      this.logger.error(
        `Failed to get query history: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'QueryHistoryService'
      );
      return [];
    }
  }

  /**
   * Get query suggestions based on history
   */
  async getSuggestions(
    organizationId: string,
    limit: number = 10
  ): Promise<QuerySuggestion[]> {
    try {
      // Get popular queries by counting occurrences
      const popularQueries = await this.historyRepository
        .createQueryBuilder('qh')
        .select('qh.query', 'query')
        .addSelect('COUNT(*)', 'usageCount')
        .addSelect('MAX(qh.timestamp)', 'lastUsed')
        .where('qh.organizationId = :organizationId', { organizationId })
        .groupBy('qh.query')
        .orderBy('usageCount', 'DESC')
        .addOrderBy('lastUsed', 'DESC')
        .limit(limit)
        .getRawMany();

      return popularQueries.map((q) => ({
        query: q.query,
        intent: this.extractIntentFromQuery(q.query),
        usageCount: parseInt(q.usageCount, 10),
        lastUsed: new Date(q.lastUsed),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get query suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'QueryHistoryService'
      );
      return [];
    }
  }

  /**
   * Extract intent from query (simple heuristic)
   */
  private extractIntentFromQuery(query: string): any {
    const lower = query.toLowerCase();
    if (lower.includes('find') || lower.includes('search')) return 'search';
    if (lower.includes('filter')) return 'filter';
    if (lower.includes('analyze')) return 'analyze';
    if (lower.includes('compare')) return 'compare';
    if (lower.includes('calculate')) return 'calculate';
    return 'search';
  }

  /**
   * Convert entity to DTO
   */
  private entityToDto(entity: QueryHistoryEntity): QueryHistory {
    return {
      id: entity.id,
      query: entity.query,
      structuredQuery: entity.structuredQuery as StructuredQuery,
      resultCount: entity.resultCount,
      executionTime: entity.executionTime,
      timestamp: entity.timestamp,
      userId: entity.userId,
      organizationId: entity.organizationId,
    };
  }
}

