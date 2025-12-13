import { ErrorCode } from './error-codes.enum';

/**
 * Standardized error response structure for all API errors
 */
export interface StandardErrorResponse {
  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Application-specific error code
   */
  errorCode: ErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Detailed error message (optional, for development)
   */
  details?: string | string[] | Record<string, any>;

  /**
   * Request correlation ID for tracking
   */
  correlationId: string;

  /**
   * Timestamp when error occurred
   */
  timestamp: string;

  /**
   * Request path that caused the error
   */
  path: string;

  /**
   * HTTP method that caused the error
   */
  method: string;

  /**
   * Validation errors (if applicable)
   */
  validationErrors?: ValidationError[];

  /**
   * Stack trace (only in development)
   */
  stack?: string;
}

/**
 * Validation error detail
 */
export interface ValidationError {
  /**
   * Field that failed validation
   */
  field: string;

  /**
   * Validation error message
   */
  message: string;

  /**
   * Rejected value
   */
  value?: any;

  /**
   * Validation constraints that failed
   */
  constraints?: Record<string, string>;
}

