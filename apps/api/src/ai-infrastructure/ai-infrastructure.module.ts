import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APIKeyEntity } from './entities/api-key.entity';
import { CostTrackingEntity } from './entities/cost-tracking.entity';
import { FeatureFlagEntity } from './entities/feature-flag.entity';
import { ABTestEntity, ABTestAssignmentEntity } from './entities/ab-test.entity';
import { AIUsageAnalyticsEntity } from './entities/ai-usage-analytics.entity';
import { APIKeyService } from './services/api-key.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { CostTrackingService } from './services/cost-tracking.service';
import { FallbackService } from './services/fallback.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { ABTestService } from './services/ab-test.service';
import { AIServiceWrapper } from './services/ai-service-wrapper.service';
import { AIInfrastructureController } from './ai-infrastructure.controller';
import { LoggingModule } from '../common/logging/logging.module';
import { OrganizationModule } from '../organization/organization.module';
import { LLMModule } from '../llm/llm.module';
import { OllamaProvider } from '../llm/providers/ollama.provider';
import { MockLLMProvider } from '../llm/providers/mock-llm.provider';
import { ILLMProvider } from '../llm/providers/llm-provider.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      APIKeyEntity,
      CostTrackingEntity,
      FeatureFlagEntity,
      ABTestEntity,
      ABTestAssignmentEntity,
      AIUsageAnalyticsEntity,
    ]),
    ConfigModule,
    LoggingModule,
    OrganizationModule,
    LLMModule,
  ],
  controllers: [AIInfrastructureController],
  providers: [
    APIKeyService,
    RateLimiterService,
    CostTrackingService,
    FallbackService,
    FeatureFlagService,
    ABTestService,
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
    AIServiceWrapper,
  ],
  exports: [
    APIKeyService,
    RateLimiterService,
    CostTrackingService,
    FallbackService,
    FeatureFlagService,
    ABTestService,
    AIServiceWrapper,
  ],
})
export class AIInfrastructureModule {}

