import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException as NestBadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';
import { StructuredLoggerService } from '../logging/structured-logger.service';
import {
  StandardErrorResponse,
  ValidationError as StandardValidationError,
} from '../errors/error-response.dto';
import { ErrorCode, ErrorCodeToStatus } from '../errors/error-codes.enum';
import { AppException } from '../errors/custom-exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request as any).correlationId || 'unknown';
    const userId = request.headers['x-user-id']?.toString() || undefined;

    // Build standardized error response
    const errorResponse = this.buildErrorResponse(
      exception,
      request,
      correlationId
    );

    // Log with structured logging
    this.logError(exception, request, errorResponse, correlationId, userId);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Builds a standardized error response from any exception
   */
  private buildErrorResponse(
    exception: unknown,
    request: Request,
    correlationId: string
  ): StandardErrorResponse {
    const baseResponse: StandardErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Handle custom AppException
    if (exception instanceof AppException) {
      return {
        ...baseResponse,
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.details,
        ...(process.env.NODE_ENV === 'development' &&
          exception.stack && {
            stack: exception.stack,
          }),
      };
    }

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const isStringResponse = typeof exceptionResponse === 'string';

      // Handle validation errors (BadRequestException from class-validator)
      if (
        exception instanceof NestBadRequestException &&
        !isStringResponse
      ) {
        // Check if validationErrors are already formatted (from our custom exceptionFactory)
        const existingValidationErrors = (exceptionResponse as any).validationErrors;
        
        if (existingValidationErrors && Array.isArray(existingValidationErrors)) {
          // Use pre-formatted validation errors
          return {
            ...baseResponse,
            statusCode: status,
            errorCode: ErrorCode.VALIDATION_ERROR,
            message: (exceptionResponse as any).message || 'Validation failed',
            details: 'One or more validation errors occurred',
            validationErrors: existingValidationErrors,
          };
        }
        
        // Otherwise, format from class-validator errors
        const validationMessages = (exceptionResponse as any).message;
        if (validationMessages) {
          const validationErrors = this.formatValidationErrors(validationMessages);
          return {
            ...baseResponse,
            statusCode: status,
            errorCode: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: 'One or more validation errors occurred',
            validationErrors,
          };
        }
      }

      // Handle standard HttpException
      return {
        ...baseResponse,
        statusCode: status,
        errorCode: this.mapStatusToErrorCode(status),
        message: isStringResponse
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message,
        details: !isStringResponse
          ? (exceptionResponse as any).error || undefined
          : undefined,
        ...(process.env.NODE_ENV === 'development' &&
          exception.stack && {
            stack: exception.stack,
          }),
      };
    }

    // Handle generic Error
    if (exception instanceof Error) {
      return {
        ...baseResponse,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: exception.stack,
          details: exception.name,
        }),
      };
    }

    // Handle unknown errors
    return {
      ...baseResponse,
      message: 'An unknown error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        details: JSON.stringify(exception),
      }),
    };
  }

  /**
   * Maps HTTP status codes to error codes
   */
  private mapStatusToErrorCode(status: number): ErrorCode {
    if (status >= 500) return ErrorCode.INTERNAL_SERVER_ERROR;
    if (status === 404) return ErrorCode.RESOURCE_NOT_FOUND;
    if (status === 403) return ErrorCode.FORBIDDEN;
    if (status === 401) return ErrorCode.UNAUTHORIZED;
    if (status === 409) return ErrorCode.RESOURCE_CONFLICT;
    if (status === 429) return ErrorCode.RATE_LIMIT_EXCEEDED;
    if (status === 400) return ErrorCode.BAD_REQUEST;
    return ErrorCode.INTERNAL_SERVER_ERROR;
  }

  /**
   * Formats class-validator errors into standardized validation errors
   */
  private formatValidationErrors(
    messages: string[] | ValidationError[]
  ): StandardValidationError[] {
    if (!Array.isArray(messages)) {
      return [];
    }

    // If messages are strings, convert to validation error format
    if (typeof messages[0] === 'string') {
      return (messages as string[]).map((message) => ({
        field: 'unknown',
        message,
      }));
    }

    // If messages are ValidationError objects from class-validator
    return (messages as ValidationError[]).map((error) => ({
      field: error.property || 'unknown',
      message: Object.values(error.constraints || {})[0] || 'Validation failed',
      value: error.value,
      constraints: error.constraints,
    }));
  }

  /**
   * Logs errors with structured logging
   */
  private logError(
    exception: unknown,
    request: Request,
    errorResponse: StandardErrorResponse,
    correlationId: string,
    userId?: string
  ): void {
    const { statusCode, errorCode, message } = errorResponse;

    if (statusCode >= 500) {
      // Server errors - log as errors
      this.logger.error(
        `HTTP ${statusCode} [${errorCode}]: ${request.method} ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
        'HttpExceptionFilter',
        {
          correlationId,
          userId,
          requestId: correlationId,
          metadata: {
            method: request.method,
            url: request.url,
            statusCode,
            errorCode,
            errorName: exception instanceof Error ? exception.name : 'UnknownError',
            errorDetails: errorResponse.details,
            validationErrors: errorResponse.validationErrors,
          },
        }
      );
    } else if (statusCode >= 400) {
      // Client errors - log as warnings
      this.logger.warn(
        `HTTP ${statusCode} [${errorCode}]: ${request.method} ${request.url} - ${message}`,
        'HttpExceptionFilter',
        {
          correlationId,
          userId,
          requestId: correlationId,
          metadata: {
            method: request.method,
            url: request.url,
            statusCode,
            errorCode,
            errorDetails: errorResponse.details,
            validationErrors: errorResponse.validationErrors,
          },
        }
      );
    }
  }
}
