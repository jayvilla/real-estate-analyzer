import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NLQService } from './nlq.service';
import { NLQController } from './nlq.controller';
import { QueryHistoryEntity } from './entities/query-history.entity';
import { IntentRecognitionService } from './services/intent-recognition.service';
import { EntityExtractionService } from './services/entity-extraction.service';
import { QueryBuilderService } from './services/query-builder.service';
import { QueryExecutionService } from './services/query-execution.service';
import { QueryHistoryService } from './services/query-history.service';
import { QueryValidationService } from './services/query-validation.service';
import { PropertyModule } from '../property/property.module';
import { DealModule } from '../deal/deal.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ValuationModule } from '../valuation/valuation.module';
import { LLMModule } from '../llm/llm.module';
import { LoggingModule } from '../common/logging/logging.module';
import { ILLMProvider } from '../llm/providers/llm-provider.interface';
import { OllamaProvider } from '../llm/providers/ollama.provider';
import { MockLLMProvider } from '../llm/providers/mock-llm.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueryHistoryEntity]),
    ConfigModule,
    forwardRef(() => PropertyModule),
    forwardRef(() => DealModule),
    forwardRef(() => AnalyticsModule),
    forwardRef(() => ValuationModule),
    forwardRef(() => LLMModule),
    LoggingModule,
  ],
  controllers: [NLQController],
  providers: [
    NLQService,
    IntentRecognitionService,
    EntityExtractionService,
    QueryBuilderService,
    QueryExecutionService,
    QueryHistoryService,
    QueryValidationService,
    OllamaProvider,
    MockLLMProvider,
    {
      provide: 'ILLMProvider',
      useFactory: (configService: ConfigService, ollama: OllamaProvider, mock: MockLLMProvider) => {
        const provider = configService.get<string>('LLM_PROVIDER', 'ollama');
        if (provider === 'ollama') {
          return ollama;
        } else if (provider === 'mock') {
          return mock;
        }
        return ollama;
      },
      inject: [ConfigService, OllamaProvider, MockLLMProvider],
    },
  ],
  exports: [NLQService],
})
export class NLQModule {}

