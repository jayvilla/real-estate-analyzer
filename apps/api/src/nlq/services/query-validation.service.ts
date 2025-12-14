import { Injectable } from '@nestjs/common';
import {
  StructuredQuery,
  QueryValidationResult,
  QueryValidationError,
} from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class QueryValidationService {
  constructor(private readonly logger: StructuredLoggerService) {}

  /**
   * Validate structured query
   */
  validateQuery(query: StructuredQuery): QueryValidationResult {
    const errors: QueryValidationError[] = [];
    const warnings: string[] = [];

    // Validate intent
    if (!query.intent) {
      errors.push({
        field: 'intent',
        message: 'Query intent is required',
        code: 'MISSING_INTENT',
      });
    }

    // Validate filters
    if (query.filters) {
      query.filters.forEach((filter, index) => {
        if (!filter.field) {
          errors.push({
            field: `filters[${index}].field`,
            message: 'Filter field is required',
            code: 'MISSING_FILTER_FIELD',
          });
        }

        if (!filter.operator) {
          errors.push({
            field: `filters[${index}].operator`,
            message: 'Filter operator is required',
            code: 'MISSING_FILTER_OPERATOR',
          });
        }

        if (filter.value === undefined || filter.value === null) {
          errors.push({
            field: `filters[${index}].value`,
            message: 'Filter value is required',
            code: 'MISSING_FILTER_VALUE',
          });
        }

        // Validate operator-value compatibility
        if (filter.operator === 'between' && !Array.isArray(filter.value)) {
          errors.push({
            field: `filters[${index}].value`,
            message: 'Between operator requires an array of two values',
            code: 'INVALID_FILTER_VALUE',
          });
        }

        if (filter.operator === 'in' && !Array.isArray(filter.value)) {
          errors.push({
            field: `filters[${index}].value`,
            message: 'In operator requires an array of values',
            code: 'INVALID_FILTER_VALUE',
          });
        }
      });
    }

    // Validate sort
    if (query.sort) {
      if (!query.sort.field) {
        errors.push({
          field: 'sort.field',
          message: 'Sort field is required',
          code: 'MISSING_SORT_FIELD',
        });
      }

      if (query.sort.direction && !['asc', 'desc'].includes(query.sort.direction)) {
        errors.push({
          field: 'sort.direction',
          message: 'Sort direction must be "asc" or "desc"',
          code: 'INVALID_SORT_DIRECTION',
        });
      }
    }

    // Validate limit
    if (query.limit !== undefined) {
      if (query.limit < 0) {
        errors.push({
          field: 'limit',
          message: 'Limit must be non-negative',
          code: 'INVALID_LIMIT',
        });
      }

      if (query.limit > 1000) {
        warnings.push('Limit exceeds 1000, performance may be impacted');
      }
    }

    // Warnings for potentially expensive queries
    if (query.filters && query.filters.length > 10) {
      warnings.push('Query has many filters, execution may be slow');
    }

    if (!query.entity && query.intent !== 'analyze') {
      warnings.push('No entity type specified, results may be ambiguous');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

