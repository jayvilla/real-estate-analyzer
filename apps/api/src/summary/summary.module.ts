import { Module, forwardRef } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { TemplateService } from './templates/template.service';
import { PdfFormatterService } from './formatters/pdf-formatter.service';
import { EmailFormatterService } from './formatters/email-formatter.service';
import { SchedulerService } from './scheduling/scheduler.service';
import { PropertyModule } from '../property/property.module';
import { DealModule } from '../deal/deal.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ValuationModule } from '../valuation/valuation.module';
import { MarketModule } from '../market/market.module';
import { LLMModule } from '../llm/llm.module';
import { LoggingModule } from '../common/logging/logging.module';
import { ILLMProvider } from '../llm/providers/llm-provider.interface';
import { OllamaProvider } from '../llm/providers/ollama.provider';
import { MockLLMProvider } from '../llm/providers/mock-llm.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PropertyModule),
    forwardRef(() => DealModule),
    forwardRef(() => AnalyticsModule),
    forwardRef(() => ValuationModule),
    forwardRef(() => MarketModule),
    forwardRef(() => LLMModule),
    LoggingModule,
  ],
  controllers: [SummaryController],
  providers: [
    SummaryService,
    TemplateService,
    PdfFormatterService,
    EmailFormatterService,
    SchedulerService,
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
  exports: [SummaryService, TemplateService, PdfFormatterService, EmailFormatterService],
})
export class SummaryModule {}

