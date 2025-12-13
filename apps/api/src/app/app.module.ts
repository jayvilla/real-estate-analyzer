import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { PropertyModule } from '../property/property.module';
import { LoggingModule } from '../common/logging/logging.module';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { CorrelationIdMiddleware } from '../common/middleware/correlation-id.middleware';
import { ValuationSaga } from '../workflows/valuation.saga';

@Module({
  imports: [
    DatabaseModule,
    EventEmitterModule.forRoot(),
    PropertyModule,
    LoggingModule, // Global logging module
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ValuationSaga,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply correlation ID middleware to all routes
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
