import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { APIKeyService } from './services/api-key.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { CostTrackingService } from './services/cost-tracking.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { ABTestService } from './services/ab-test.service';
import {
  FeatureFlag,
  ABTest,
  RateLimitConfig,
} from '@real-estate-analyzer/types';

@Controller('ai-infrastructure')
@UseGuards(JwtAuthGuard)
export class AIInfrastructureController {
  constructor(
    private readonly apiKeyService: APIKeyService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly costTrackingService: CostTrackingService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly abTestService: ABTestService
  ) {}

  // API Key Management
  @Post('api-keys')
  async storeAPIKey(
    @Body() body: { provider: string; apiKey: string; name?: string; expiresAt?: Date },
    @Request() req: any
  ) {
    return this.apiKeyService.storeAPIKey(
      req.user.organizationId,
      body.provider,
      body.apiKey,
      body.name,
      body.expiresAt
    );
  }

  @Get('api-keys')
  async listAPIKeys(@Request() req: any) {
    return this.apiKeyService.listAPIKeys(req.user.organizationId);
  }

  @Delete('api-keys/:id')
  async deleteAPIKey(@Param('id') id: string, @Request() req: any) {
    await this.apiKeyService.deleteAPIKey(id, req.user.organizationId);
    return { success: true };
  }

  // Cost Tracking
  @Get('costs/summary')
  async getCostSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any
  ) {
    return this.costTrackingService.getCostSummary(
      req?.user?.organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get('costs/analytics')
  async getUsageAnalytics(
    @Query('feature') feature?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any
  ) {
    return this.costTrackingService.getUsageAnalytics(
      req?.user?.organizationId,
      feature,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  // Feature Flags
  @Get('feature-flags')
  async listFeatureFlags(): Promise<FeatureFlag[]> {
    return this.featureFlagService.listFeatureFlags();
  }

  @Get('feature-flags/:name')
  async checkFeatureFlag(
    @Param('name') name: string,
    @Request() req: any
  ): Promise<{ enabled: boolean }> {
    const enabled = await this.featureFlagService.isFeatureEnabled(
      name,
      req.user.id,
      req.user.organizationId
    );
    return { enabled };
  }

  @Post('feature-flags')
  async createFeatureFlag(@Body() flag: Partial<FeatureFlag>) {
    return this.featureFlagService.setFeatureFlag(flag);
  }

  @Put('feature-flags/:name')
  async updateFeatureFlag(
    @Param('name') name: string,
    @Body() flag: Partial<FeatureFlag>
  ) {
    return this.featureFlagService.setFeatureFlag({ ...flag, name });
  }

  // AB Testing
  @Get('ab-tests')
  async getActiveTests() {
    return this.abTestService.getActiveTests();
  }

  @Get('ab-tests/:testId/variant')
  async getVariant(
    @Param('testId') testId: string,
    @Request() req: any
  ): Promise<{ variantId: string | null }> {
    const variantId = await this.abTestService.getVariant(
      testId,
      req.user.id,
      req.user.organizationId
    );
    return { variantId };
  }

  @Post('ab-tests')
  async createABTest(@Body() test: Partial<ABTest>) {
    return this.abTestService.createABTest(test);
  }

  @Post('ab-tests/:testId/metrics')
  async trackMetric(
    @Param('testId') testId: string,
    @Body() body: { variantId: string; metric: string; value: number },
    @Request() req: any
  ) {
    await this.abTestService.trackMetric(
      testId,
      body.variantId,
      body.metric,
      body.value,
      req.user.id
    );
    return { success: true };
  }

  // Rate Limiting
  @Get('rate-limits/:provider')
  async getRateLimitConfig(@Param('provider') provider: string): Promise<RateLimitConfig> {
    return this.rateLimiterService.getRateLimitConfig(provider);
  }
}

