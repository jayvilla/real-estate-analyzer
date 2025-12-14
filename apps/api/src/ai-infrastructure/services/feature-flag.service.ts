import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '@real-estate-analyzer/types';
import { FeatureFlagEntity } from '../entities/feature-flag.entity';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class FeatureFlagService {
  private cache: Map<string, FeatureFlagEntity> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  constructor(
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Check if feature is enabled for user/organization
   */
  async isFeatureEnabled(
    featureName: string,
    userId?: string,
    organizationId?: string
  ): Promise<boolean> {
    const flag = await this.getFeatureFlag(featureName);
    if (!flag) {
      return false; // Feature not found = disabled
    }

    if (!flag.enabled) {
      return false;
    }

    // Check target users
    if (flag.targetUsers && flag.targetUsers.length > 0) {
      if (!userId || !flag.targetUsers.includes(userId)) {
        return false;
      }
    }

    // Check target organizations
    if (flag.targetOrganizations && flag.targetOrganizations.length > 0) {
      if (!organizationId || !flag.targetOrganizations.includes(organizationId)) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      if (userId) {
        // Deterministic rollout based on user ID
        const hash = this.hashString(userId + featureName);
        const percentage = (hash % 100) + 1;
        if (percentage > flag.rolloutPercentage) {
          return false;
        }
      } else {
        // Random rollout if no user ID
        const random = Math.random() * 100;
        if (random > flag.rolloutPercentage) {
          return false;
        }
      }
    }

    // Check additional conditions
    if (flag.conditions) {
      // Custom condition evaluation (simplified)
      // In production, use a more sophisticated condition engine
      for (const [key, value] of Object.entries(flag.conditions)) {
        // Example: conditions could check organization tier, user role, etc.
        // This is a placeholder for custom logic
      }
    }

    return true;
  }

  /**
   * Get feature flag
   */
  async getFeatureFlag(name: string): Promise<FeatureFlagEntity | null> {
    // Check cache
    if (Date.now() - this.lastCacheUpdate < this.cacheExpiry) {
      const cached = this.cache.get(name);
      if (cached) {
        return cached;
      }
    }

    // Fetch from database
    const flag = await this.featureFlagRepository.findOne({
      where: { name },
    });

    if (flag) {
      this.cache.set(name, flag);
      this.lastCacheUpdate = Date.now();
    }

    return flag;
  }

  /**
   * Create or update feature flag
   */
  async setFeatureFlag(flag: Partial<FeatureFlag>): Promise<FeatureFlagEntity> {
    let entity = await this.featureFlagRepository.findOne({
      where: { name: flag.name! },
    });

    if (entity) {
      Object.assign(entity, flag);
    } else {
      entity = this.featureFlagRepository.create(flag as FeatureFlagEntity);
    }

    const saved = await this.featureFlagRepository.save(entity);
    this.cache.set(saved.name, saved);
    this.lastCacheUpdate = Date.now();

    this.logger.log(
      `Feature flag ${saved.name} ${saved.enabled ? 'enabled' : 'disabled'}`,
      'FeatureFlagService'
    );

    return saved;
  }

  /**
   * List all feature flags
   */
  async listFeatureFlags(): Promise<FeatureFlagEntity[]> {
    return this.featureFlagRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Hash string for deterministic rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    this.cache.clear();
    this.lastCacheUpdate = 0;
  }
}

