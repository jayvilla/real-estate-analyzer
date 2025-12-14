import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (provider?: string) =>
  SetMetadata(RATE_LIMIT_KEY, provider || 'default');

