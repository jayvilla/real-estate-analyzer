import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from '../services/rate-limiter.service';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const provider = this.reflector.get<string>(RATE_LIMIT_KEY, context.getHandler());
    if (!provider) {
      return true; // No rate limit configured
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Create rate limit key (user-based or IP-based)
    const key = user
      ? `user:${user.id}:${provider}`
      : `ip:${request.ip}:${provider}`;

    const config = this.rateLimiterService.getRateLimitConfig(provider);
    const result = await this.rateLimiterService.checkRateLimit(key, config);

    if (!result.allowed) {
      throw new HttpException(
        {
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', config.maxRequests);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

    return true;
  }
}

