/**
 * Shared error types for API error responses
 */

export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Authentication & Authorization (401, 403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Not Found (404)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Conflict (409)
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Server Errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Bad Request (400)
  BAD_REQUEST = 'BAD_REQUEST',
  INVALID_UUID = 'INVALID_UUID',
  INVALID_ENUM_VALUE = 'INVALID_ENUM_VALUE',
}

/**
 * Standardized error response from API
 */
export interface ApiErrorResponse {
  statusCode: number;
  errorCode: ErrorCode;
  message: string;
  details?: string | string[] | Record<string, any>;
  correlationId: string;
  timestamp: string;
  path: string;
  method: string;
  validationErrors?: ValidationError[];
  stack?: string;
}

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}

