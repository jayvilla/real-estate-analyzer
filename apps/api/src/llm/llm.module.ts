import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LLMService } from './llm.service';
import { LLMController } from './llm.controller';
import { LLMCacheService } from './cache/llm-cache.service';
import { OllamaProvider } from './providers/ollama.provider';
import { MockLLMProvider } from './providers/mock-llm.provider';
import { ILLMProvider } from './providers/llm-provider.interface';
import { PropertyModule } from '../property/property.module';
import { DealModule } from '../deal/deal.module';
import { ValuationModule } from '../valuation/valuation.module';
import { MarketModule } from '../market/market.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { LoggingModule } from '../common/logging/logging.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PropertyModule),
    forwardRef(() => DealModule),
    forwardRef(() => ValuationModule),
    forwardRef(() => MarketModule),
    forwardRef(() => AnalyticsModule),
    LoggingModule,
  ],
  controllers: [LLMController],
  providers: [
    LLMService,
    LLMCacheService,
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
        
        // Default to Ollama
        return ollama;
      },
      inject: [ConfigService, OllamaProvider, MockLLMProvider],
    },
  ],
  exports: [LLMService],
})
export class LLMModule {}

