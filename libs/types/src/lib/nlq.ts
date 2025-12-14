/**
 * Natural Language Query Types
 */

export enum QueryIntent {
  SEARCH = 'search',
  FILTER = 'filter',
  ANALYZE = 'analyze',
  COMPARE = 'compare',
  CALCULATE = 'calculate',
  LIST = 'list',
  SHOW = 'show',
  FIND = 'find',
  UNKNOWN = 'unknown',
}

export enum EntityType {
  PROPERTY = 'property',
  DEAL = 'deal',
  METRIC = 'metric',
  LOCATION = 'location',
  DATE = 'date',
  NUMBER = 'number',
  STATUS = 'status',
}

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  originalText: string;
}

export interface QueryIntentResult {
  intent: QueryIntent;
  confidence: number;
  entities: ExtractedEntity[];
  parameters: Record<string, any>;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'between';
  value: any;
}

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface StructuredQuery {
  intent: QueryIntent;
  entity: EntityType | null;
  filters: QueryFilter[];
  sort?: QuerySort;
  limit?: number;
  aggregations?: string[];
  groupBy?: string[];
}

export interface QueryResult {
  query: string;
  structuredQuery: StructuredQuery;
  results: any[];
  formattedResults: string;
  executionTime: number;
  resultCount: number;
}

export interface QueryHistory {
  id: string;
  query: string;
  structuredQuery: StructuredQuery;
  resultCount: number;
  executionTime: number;
  timestamp: Date;
  userId: string;
  organizationId: string;
}

export interface QuerySuggestion {
  query: string;
  intent: QueryIntent;
  usageCount: number;
  lastUsed: Date;
}

export interface QueryValidationError {
  field: string;
  message: string;
  code: string;
}

export interface QueryValidationResult {
  valid: boolean;
  errors: QueryValidationError[];
  warnings: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryResult?: QueryResult;
  error?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  organizationId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

