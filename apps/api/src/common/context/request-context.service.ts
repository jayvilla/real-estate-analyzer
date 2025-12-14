import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

/**
 * Service to access request context (like correlation ID) in services
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  getCorrelationId(): string | undefined {
    return this.request?.correlationId;
  }
}

