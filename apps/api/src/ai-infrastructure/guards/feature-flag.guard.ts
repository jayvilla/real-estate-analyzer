import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagService } from '../services/feature-flag.service';
import { FEATURE_FLAG_KEY } from '../decorators/feature-flag.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureName = this.reflector.get<string>(FEATURE_FLAG_KEY, context.getHandler());
    if (!featureName) {
      return true; // No feature flag configured
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const enabled = await this.featureFlagService.isFeatureEnabled(
      featureName,
      user?.id,
      user?.organizationId
    );

    if (!enabled) {
      throw new HttpException(
        {
          message: `Feature ${featureName} is not enabled`,
          code: 'FEATURE_DISABLED',
        },
        HttpStatus.FORBIDDEN
      );
    }

    return true;
  }
}

