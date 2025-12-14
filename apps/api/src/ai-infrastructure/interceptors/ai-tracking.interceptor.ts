import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CostTrackingService } from '../services/cost-tracking.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class AITrackingInterceptor implements NestInterceptor {
  constructor(
    private readonly costTrackingService: CostTrackingService,
    private readonly logger: StructuredLoggerService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const user = request.user;

    return next.handle().pipe(
      tap(async (response) => {
        // Track successful AI operations
        if (response?.usage || response?.tokens) {
          const usage = response.usage || {};
          const feature = this.extractFeature(context);

          if (usage.totalTokens > 0) {
            const cost = this.costTrackingService.calculateCost(
              response.provider || 'unknown',
              response.model || 'unknown',
              usage.promptTokens || 0,
              usage.completionTokens || 0
            );

            await this.costTrackingService.trackCost({
              provider: response.provider || 'unknown',
              model: response.model || 'unknown',
              promptTokens: usage.promptTokens || 0,
              completionTokens: usage.completionTokens || 0,
              totalTokens: usage.totalTokens || 0,
              estimatedCost: cost,
              timestamp: new Date(),
              userId: user?.id,
              organizationId: user?.organizationId,
              feature,
            });

            await this.costTrackingService.trackUsage({
              feature,
              userId: user?.id,
              organizationId: user?.organizationId,
              provider: response.provider || 'unknown',
              model: response.model || 'unknown',
              success: true,
              responseTime: Date.now() - startTime,
              tokensUsed: usage.totalTokens || 0,
              cost,
            });
          }
        }
      }),
      catchError(async (error) => {
        // Track failed AI operations
        const feature = this.extractFeature(context);
        await this.costTrackingService.trackUsage({
          feature,
          userId: user?.id,
          organizationId: user?.organizationId,
          provider: 'unknown',
          model: 'unknown',
          success: false,
          responseTime: Date.now() - startTime,
          tokensUsed: 0,
          cost: 0,
          errorCode: error.code || 'UNKNOWN_ERROR',
        });

        throw error;
      })
    );
  }

  /**
   * Extract feature name from context
   */
  private extractFeature(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();
    const route = `${controller.name}.${handler.name}`;

    // Map routes to features
    if (route.includes('Property') || route.includes('property')) {
      return 'property-analysis';
    }
    if (route.includes('Deal') || route.includes('deal')) {
      return 'deal-recommendation';
    }
    if (route.includes('Summary') || route.includes('summary')) {
      return 'summary-generation';
    }
    if (route.includes('NLQ') || route.includes('nlq') || route.includes('query')) {
      return 'natural-language-query';
    }
    if (route.includes('Market') || route.includes('market')) {
      return 'market-analysis';
    }

    return 'unknown';
  }
}

