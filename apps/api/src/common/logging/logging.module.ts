import { Module, Global } from '@nestjs/common';
import { StructuredLoggerService } from './structured-logger.service';
import { CorrelationIdMiddleware } from '../middleware/correlation-id.middleware';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

@Global()
@Module({
  providers: [
    StructuredLoggerService,
    CorrelationIdMiddleware,
    LoggingInterceptor,
  ],
  exports: [StructuredLoggerService, CorrelationIdMiddleware, LoggingInterceptor],
})
export class LoggingModule {}

