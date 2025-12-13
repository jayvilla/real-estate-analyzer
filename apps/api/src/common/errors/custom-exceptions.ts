import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorCodeToStatus } from './error-codes.enum';
import { ValidationError } from './error-response.dto';

/**
 * Base custom exception with error code support
 */
export class AppException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    statusCode?: number,
    public readonly details?: any
  ) {
    super(
      {
        errorCode,
        message,
        details,
      },
      statusCode || ErrorCodeToStatus[errorCode] || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Resource not found exception
 */
export class ResourceNotFoundException extends AppException {
  constructor(resource: string, identifier: string | number) {
    super(
      ErrorCode.RESOURCE_NOT_FOUND,
      `${resource} with identifier '${identifier}' not found`,
      HttpStatus.NOT_FOUND,
      { resource, identifier }
    );
  }
}

/**
 * Property not found exception
 */
export class PropertyNotFoundException extends AppException {
  constructor(propertyId: string) {
    super(
      ErrorCode.PROPERTY_NOT_FOUND,
      `Property with ID '${propertyId}' not found`,
      HttpStatus.NOT_FOUND,
      { propertyId }
    );
  }
}

/**
 * Validation exception with detailed field errors
 */
export class ValidationException extends AppException {
  constructor(
    message: string,
    public readonly validationErrors: ValidationError[]
  ) {
    super(
      ErrorCode.VALIDATION_ERROR,
      message,
      HttpStatus.BAD_REQUEST,
      { validationErrors }
    );
  }
}

/**
 * Database operation exception
 */
export class DatabaseException extends AppException {
  constructor(message: string, originalError?: Error) {
    super(
      ErrorCode.DATABASE_ERROR,
      `Database operation failed: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        originalError: originalError?.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: originalError?.stack,
        }),
      }
    );
  }
}

/**
 * Conflict exception (e.g., duplicate entry)
 */
export class ConflictException extends AppException {
  constructor(message: string, public readonly conflictingField?: string) {
    super(
      ErrorCode.RESOURCE_CONFLICT,
      message,
      HttpStatus.CONFLICT,
      { conflictingField }
    );
  }
}

/**
 * Bad request exception
 */
export class BadRequestException extends AppException {
  constructor(message: string, details?: any) {
    super(ErrorCode.BAD_REQUEST, message, HttpStatus.BAD_REQUEST, details);
  }
}

