import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request } from 'express';
import { StructuredLoggerService } from '../logging/structured-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params, headers } = request;
    const correlationId = (request as any).correlationId || 'unknown';
    const startTime = Date.now();

    // Extract user ID from headers or JWT if available
    const userId = headers['x-user-id']?.toString() || undefined;

    // Log incoming request
    this.logger.logWithMetadata(
      'info' as any,
      `Incoming Request: ${method} ${url}`,
      {
        method,
        url,
        query: Object.keys(query).length > 0 ? query : undefined,
        params: Object.keys(params).length > 0 ? params : undefined,
        userAgent: headers['user-agent'],
        ip: request.ip || headers['x-forwarded-for'] || 'unknown',
      },
      'HTTP',
      {
        correlationId,
        userId,
        requestId: correlationId,
      }
    );

    // Log request body in debug mode (sensitive data should be filtered)
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(
        `Request Body: ${JSON.stringify(this.sanitizeBody(body))}`,
        'HTTP',
        { correlationId, requestId: correlationId }
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Log successful response
          this.logger.logWithMetadata(
            'info' as any,
            `Outgoing Response: ${method} ${url} ${statusCode}`,
            {
              method,
              url,
              statusCode,
              responseSize: JSON.stringify(data).length,
            },
            'HTTP',
            {
              correlationId,
              userId,
              requestId: correlationId,
              duration,
            }
          );

          // Log performance warning for slow requests
          if (duration > 1000) {
            this.logger.logPerformance(
              `${method} ${url}`,
              duration,
              'HTTP',
              { correlationId, requestId: correlationId }
            );
          }
        },
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log error with full context
        this.logger.error(
          `Request Error: ${method} ${url} - ${error.message}`,
          error.stack,
          'HTTP',
          {
            correlationId,
            userId,
            requestId: correlationId,
            duration,
            metadata: {
              method,
              url,
              errorName: error.name,
              statusCode: error.status || 500,
            },
          }
        );

        return throwError(() => error);
      })
    );
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
