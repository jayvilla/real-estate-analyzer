import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract correlation ID from request
 * Usage: @CorrelationId() correlationId: string
 */
export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return (request as any).correlationId || 'unknown';
  }
);

