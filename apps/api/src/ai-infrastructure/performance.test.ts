/**
 * Performance Tests for AI Queries
 * 
 * These tests measure and validate performance characteristics of AI operations:
 * - Response times
 * - Throughput
 * - Concurrent request handling
 * - Cache effectiveness
 * - Rate limiting behavior
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AIServiceWrapper } from './services/ai-service-wrapper.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { CostTrackingService } from './services/cost-tracking.service';
import { LLMCacheService } from '../llm/cache/llm-cache.service';
import { MockLLMProvider } from '../llm/providers/mock-llm.provider';

describe('AI Performance Tests', () => {
  let aiServiceWrapper: AIServiceWrapper;
  let rateLimiterService: RateLimiterService;
  let cacheService: LLMCacheService;
  let mockLLMProvider: MockLLMProvider;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIServiceWrapper,
        RateLimiterService,
        CostTrackingService,
        LLMCacheService,
        MockLLMProvider,
        {
          provide: 'ILLMProvider',
          useClass: MockLLMProvider,
        },
      ],
    }).compile();

    aiServiceWrapper = module.get<AIServiceWrapper>(AIServiceWrapper);
    rateLimiterService = module.get<RateLimiterService>(RateLimiterService);
    cacheService = module.get<LLMCacheService>(LLMCacheService);
    mockLLMProvider = module.get<MockLLMProvider>(MockLLMProvider);
  });

  describe('Response Time Performance', () => {
    it('should complete single request within acceptable time', async () => {
      const startTime = Date.now();
      
      await aiServiceWrapper.generate(
        {
          messages: [{ role: 'user', content: 'Test query' }],
        },
        {
          feature: 'test',
          organizationId: 'org-123',
          useFallback: false,
          trackCost: false,
        }
      );

      const duration = Date.now() - startTime;
      
      // Should complete within 5 seconds for mock provider
      expect(duration).toBeLessThan(5000);
    });

    it('should handle multiple sequential requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        messages: [{ role: 'user', content: `Query ${i}` }],
      }));

      const startTime = Date.now();

      await Promise.all(
        requests.map((req) =>
          aiServiceWrapper.generate(req, {
            feature: 'test',
            organizationId: 'org-123',
            useFallback: false,
            trackCost: false,
          })
        )
      );

      const duration = Date.now() - startTime;
      const avgTime = duration / requests.length;

      // Average time per request should be reasonable
      expect(avgTime).toBeLessThan(1000);
    });
  });

  describe('Cache Performance', () => {
    it('should significantly improve response time with cache', async () => {
      const request = {
        messages: [{ role: 'user', content: 'Cached query' }],
      };

      // First request (cache miss)
      const startTime1 = Date.now();
      await aiServiceWrapper.generate(request, {
        feature: 'test',
        organizationId: 'org-123',
        useFallback: false,
        trackCost: false,
      });
      const duration1 = Date.now() - startTime1;

      // Second request (cache hit)
      const startTime2 = Date.now();
      await aiServiceWrapper.generate(request, {
        feature: 'test',
        organizationId: 'org-123',
        useFallback: false,
        trackCost: false,
      });
      const duration2 = Date.now() - startTime2;

      // Cached request should be much faster
      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(100); // Cache lookup should be very fast
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests without degradation', async () => {
      const concurrentRequests = 20;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => ({
        messages: [{ role: 'user', content: `Concurrent query ${i}` }],
      }));

      const startTime = Date.now();

      const results = await Promise.all(
        requests.map((req) =>
          aiServiceWrapper.generate(req, {
            feature: 'test',
            organizationId: 'org-123',
            useFallback: false,
            trackCost: false,
          })
        )
      );

      const duration = Date.now() - startTime;

      expect(results).toHaveLength(concurrentRequests);
      // All requests should complete within reasonable time
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should enforce rate limits without significant overhead', async () => {
      const rateLimitKey = 'test:rate:limit';
      const config = {
        maxRequests: 10,
        windowMs: 60000, // 1 minute
      };

      // Make requests up to limit
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        const allowed = await rateLimiterService.checkRateLimit(rateLimitKey, config);
        expect(allowed.allowed).toBe(true);
      }
      const duration = Date.now() - startTime;

      // Rate limit checks should be fast
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Cost Tracking Performance', () => {
    it('should track costs without significant overhead', async () => {
      const startTime = Date.now();

      await aiServiceWrapper.generate(
        {
          messages: [{ role: 'user', content: 'Cost tracking test' }],
        },
        {
          feature: 'test',
          organizationId: 'org-123',
          useFallback: false,
          trackCost: true,
        }
      );

      const duration = Date.now() - startTime;

      // Cost tracking should add minimal overhead
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Throughput Tests', () => {
    it('should handle high throughput scenarios', async () => {
      const requestsPerSecond = 10;
      const totalRequests = 50;
      const requests = Array.from({ length: totalRequests }, (_, i) => ({
        messages: [{ role: 'user', content: `Throughput test ${i}` }],
      }));

      const startTime = Date.now();
      let completed = 0;

      // Simulate rate-limited throughput
      for (let i = 0; i < requests.length; i += requestsPerSecond) {
        const batch = requests.slice(i, i + requestsPerSecond);
        await Promise.all(
          batch.map((req) =>
            aiServiceWrapper.generate(req, {
              feature: 'test',
              organizationId: 'org-123',
              useFallback: false,
              trackCost: false,
            })
          )
        );
        completed += batch.length;
      }

      const duration = Date.now() - startTime;
      const actualThroughput = (completed / duration) * 1000; // requests per second

      expect(completed).toBe(totalRequests);
      expect(actualThroughput).toBeGreaterThan(requestsPerSecond * 0.8); // At least 80% of target
    });
  });
});

