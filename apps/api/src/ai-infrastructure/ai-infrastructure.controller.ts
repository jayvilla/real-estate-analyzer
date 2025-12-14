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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('AI Infrastructure')
@Controller('ai-infrastructure')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({
    summary: 'Store API key for AI provider',
    description: `
      Securely stores an API key for an AI provider (OpenAI, Anthropic, etc.).
      
      **Security Features:**
      - Keys are hashed using SHA-256 before storage
      - Keys are encrypted at rest
      - Organization-scoped access control
      - Optional expiration dates
      
      **Supported Providers:**
      - openai: OpenAI API
      - anthropic: Anthropic Claude API
      - ollama: Local Ollama instance (optional key)
      
      Keys are used automatically when making AI API calls for the organization.
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['provider', 'apiKey'],
      properties: {
        provider: {
          type: 'string',
          enum: ['openai', 'anthropic', 'ollama'],
          description: 'AI provider name',
        },
        apiKey: {
          type: 'string',
          description: 'API key for the provider (will be hashed before storage)',
          example: 'sk-...',
        },
        name: {
          type: 'string',
          description: 'Optional descriptive name for the key',
          example: 'Production OpenAI Key',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Optional expiration date for the key',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'API key stored successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid provider or API key format',
  })
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
  @ApiOperation({
    summary: 'List API keys for organization',
    description: `
      Returns list of API keys stored for the organization.
      
      **Security Note:**
      - Actual API keys are never returned (only metadata)
      - Keys are shown as masked (e.g., sk-...****)
      - Includes key status, expiration, and last used date
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          provider: { type: 'string' },
          name: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async listAPIKeys(@Request() req: any) {
    return this.apiKeyService.listAPIKeys(req.user.organizationId);
  }

  @Delete('api-keys/:id')
  @ApiOperation({
    summary: 'Delete API key',
    description: 'Permanently deletes an API key. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'API key ID to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'API key deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
  })
  async deleteAPIKey(@Param('id') id: string, @Request() req: any) {
    await this.apiKeyService.deleteAPIKey(id, req.user.organizationId);
    return { success: true };
  }

  // Cost Tracking
  @Get('costs/summary')
  @ApiOperation({
    summary: 'Get AI service cost summary',
    description: `
      Returns cost summary for AI service usage.
      
      **Summary Includes:**
      - Total costs by provider
      - Costs by feature/endpoint
      - Daily/weekly/monthly breakdowns
      - Cost trends
      - Token usage statistics
      
      **Use Cases:**
      - Budget tracking
      - Cost optimization
      - Usage analytics
      - Billing reconciliation
    `,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    format: 'date-time',
    description: 'Start date for cost summary (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    format: 'date-time',
    description: 'End date for cost summary (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cost summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalCost: { type: 'number', description: 'Total cost in USD' },
        costsByProvider: {
          type: 'object',
          description: 'Costs grouped by provider',
        },
        costsByFeature: {
          type: 'object',
          description: 'Costs grouped by feature',
        },
        tokenUsage: {
          type: 'object',
          properties: {
            totalTokens: { type: 'number' },
            promptTokens: { type: 'number' },
            completionTokens: { type: 'number' },
          },
        },
        period: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Get AI usage analytics',
    description: `
      Returns detailed analytics for AI service usage.
      
      **Analytics Include:**
      - Request counts by feature
      - Success/failure rates
      - Average response times
      - Peak usage times
      - Most used features
      - Cost per feature
      
      Useful for understanding usage patterns and optimizing costs.
    `,
  })
  @ApiQuery({
    name: 'feature',
    required: false,
    type: String,
    description: 'Filter by specific feature',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage analytics retrieved successfully',
    type: [Object],
  })
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
  @ApiOperation({
    summary: 'List all feature flags',
    description: `
      Returns list of all feature flags in the system.
      
      **Feature Flags:**
      - Enable/disable AI features per organization or user
      - Gradual rollout support
      - A/B testing integration
      - Custom targeting rules
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flags retrieved successfully',
    type: [Object],
  })
  async listFeatureFlags(): Promise<FeatureFlag[]> {
    return this.featureFlagService.listFeatureFlags();
  }

  @Get('feature-flags/:name')
  @ApiOperation({
    summary: 'Check if feature flag is enabled',
    description: `
      Checks if a specific feature flag is enabled for the current user/organization.
      
      **Evaluation:**
      - Checks organization-level flags
      - Checks user-level overrides
      - Applies targeting rules
      - Returns enabled/disabled status
    `,
  })
  @ApiParam({
    name: 'name',
    description: 'Feature flag name',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag status',
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Create feature flag',
    description: 'Creates a new feature flag with specified configuration.',
  })
  @ApiBody({
    description: 'Feature flag configuration',
    type: Object,
  })
  @ApiResponse({
    status: 201,
    description: 'Feature flag created successfully',
  })
  async createFeatureFlag(@Body() flag: Partial<FeatureFlag>) {
    return this.featureFlagService.setFeatureFlag(flag);
  }

  @Put('feature-flags/:name')
  @ApiOperation({
    summary: 'Update feature flag',
    description: 'Updates an existing feature flag configuration.',
  })
  @ApiParam({
    name: 'name',
    description: 'Feature flag name',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag updated successfully',
  })
  async updateFeatureFlag(
    @Param('name') name: string,
    @Body() flag: Partial<FeatureFlag>
  ) {
    return this.featureFlagService.setFeatureFlag({ ...flag, name });
  }

  // AB Testing
  @Get('ab-tests')
  @ApiOperation({
    summary: 'Get active A/B tests',
    description: `
      Returns list of currently active A/B tests.
      
      **A/B Testing:**
      - Test different AI prompt strategies
      - Compare model performance
      - Optimize feature implementations
      - Measure user engagement
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Active A/B tests retrieved successfully',
    type: [Object],
  })
  async getActiveTests() {
    return this.abTestService.getActiveTests();
  }

  @Get('ab-tests/:testId/variant')
  @ApiOperation({
    summary: 'Get user variant assignment for A/B test',
    description: `
      Returns the variant assignment for the current user in an A/B test.
      
      **Assignment:**
      - Consistent assignment (same user always gets same variant)
      - Random distribution
      - Can be overridden for specific users
    `,
  })
  @ApiParam({
    name: 'testId',
    description: 'A/B test ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Variant assignment',
    schema: {
      type: 'object',
      properties: {
        variantId: {
          type: 'string',
          nullable: true,
          description: 'Assigned variant ID, or null if not assigned',
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Create A/B test',
    description: 'Creates a new A/B test with specified variants and configuration.',
  })
  @ApiBody({
    description: 'A/B test configuration',
    type: Object,
  })
  @ApiResponse({
    status: 201,
    description: 'A/B test created successfully',
  })
  async createABTest(@Body() test: Partial<ABTest>) {
    return this.abTestService.createABTest(test);
  }

  @Post('ab-tests/:testId/metrics')
  @ApiOperation({
    summary: 'Track A/B test metric',
    description: `
      Records a metric value for an A/B test variant.
      
      **Metrics:**
      - Success rates
      - Response times
      - User engagement
      - Cost per request
      - Custom business metrics
    `,
  })
  @ApiParam({
    name: 'testId',
    description: 'A/B test ID',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['variantId', 'metric', 'value'],
      properties: {
        variantId: {
          type: 'string',
          description: 'Variant ID',
        },
        metric: {
          type: 'string',
          description: 'Metric name',
          example: 'response_time',
        },
        value: {
          type: 'number',
          description: 'Metric value',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Metric tracked successfully',
  })
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
  @ApiOperation({
    summary: 'Get rate limit configuration for provider',
    description: `
      Returns rate limit configuration for a specific AI provider.
      
      **Rate Limits:**
      - Requests per minute/hour/day
      - Tokens per minute
      - Organization-level limits
      - User-level limits
      
      Used to prevent API abuse and manage costs.
    `,
  })
  @ApiParam({
    name: 'provider',
    description: 'AI provider name',
    enum: ['openai', 'anthropic', 'ollama'],
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit configuration',
    type: Object,
  })
  async getRateLimitConfig(@Param('provider') provider: string): Promise<RateLimitConfig> {
    return this.rateLimiterService.getRateLimitConfig(provider);
  }
}
