import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { PropertyModule } from '../property/property.module';
import { DealModule } from '../deal/deal.module';
import { ValuationModule } from '../valuation/valuation.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { HandlersModule } from '../handlers/handlers.module';
import { EventStoreModule } from '../common/event-store/event-store.module';
import { ContextModule } from '../common/context/context.module';
import { LoggingModule } from '../common/logging/logging.module';
import { AuthModule } from '../auth/auth.module';
import { ScoringModule } from '../scoring/scoring.module';
import { MarketModule } from '../market/market.module';
import { LLMModule } from '../llm/llm.module';
import { NLQModule } from '../nlq/nlq.module';
import { SummaryModule } from '../summary/summary.module';
import { AIInfrastructureModule } from '../ai-infrastructure/ai-infrastructure.module';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { CorrelationIdMiddleware } from '../common/middleware/correlation-id.middleware';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ValuationSaga } from '../workflows/valuation.saga';

@Module({
  imports: [
    DatabaseModule,
    EventEmitterModule.forRoot(),
    AuthModule, // Authentication and authorization
    PropertyModule,
    DealModule,
    ValuationModule,
    AnalyticsModule, // Analytics and reporting
    HandlersModule, // Event handlers
    EventStoreModule, // Event store for idempotency
    ContextModule, // Request context service
    LoggingModule, // Global logging module
    ScoringModule, // Deal scoring and analysis
    MarketModule, // Market trend analysis
    LLMModule, // LLM-assisted insights
    NLQModule, // Natural language queries
    SummaryModule, // AI-driven summaries
    AIInfrastructureModule, // AI infrastructure & integration
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ValuationSaga, // Saga/workflow orchestration
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Global JWT guard (can be bypassed with @Public())
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply correlation ID middleware to all routes
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
