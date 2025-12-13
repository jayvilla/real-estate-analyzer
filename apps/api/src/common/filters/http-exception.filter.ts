import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StructuredLoggerService } from '../logging/structured-logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request as any).correlationId || 'unknown';
    const userId = request.headers['x-user-id']?.toString() || undefined;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorMessage =
      typeof message === 'string'
        ? message
        : (message as any).message || 'An error occurred';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      correlationId, // Include correlation ID in error response
      ...(process.env.NODE_ENV === 'development' &&
        exception instanceof Error && {
          stack: exception.stack,
        }),
    };

    // Log with structured logging
    if (status >= 500) {
      // Server errors - log as errors
      this.logger.error(
        `HTTP ${status}: ${request.method} ${request.url} - ${errorMessage}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
        'HttpExceptionFilter',
        {
          correlationId,
          userId,
          requestId: correlationId,
          metadata: {
            method: request.method,
            url: request.url,
            statusCode: status,
            errorName: exception instanceof Error ? exception.name : 'UnknownError',
            errorDetails:
              exception instanceof HttpException
                ? exception.getResponse()
                : undefined,
          },
        }
      );
    } else {
      // Client errors - log as warnings
      this.logger.warn(
        `HTTP ${status}: ${request.method} ${request.url} - ${errorMessage}`,
        'HttpExceptionFilter',
        {
          correlationId,
          userId,
          requestId: correlationId,
          metadata: {
            method: request.method,
            url: request.url,
            statusCode: status,
            errorDetails:
              exception instanceof HttpException
                ? exception.getResponse()
                : undefined,
          },
        }
      );
    }

    response.status(status).json(errorResponse);
  }
}
