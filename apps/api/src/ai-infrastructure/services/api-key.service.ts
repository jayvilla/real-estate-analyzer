import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { APIKeyEntity } from '../entities/api-key.entity';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class APIKeyService {
  constructor(
    @InjectRepository(APIKeyEntity)
    private readonly apiKeyRepository: Repository<APIKeyEntity>,
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Store API key securely (hashed)
   */
  async storeAPIKey(
    organizationId: string,
    provider: string,
    apiKey: string,
    name?: string,
    expiresAt?: Date
  ): Promise<APIKeyEntity> {
    // Hash the API key for storage
    const keyHash = this.hashAPIKey(apiKey);
    const keyPrefix = apiKey.substring(0, 8) + '...';

    // Check if key already exists
    const existing = await this.apiKeyRepository.findOne({
      where: { organizationId, provider, keyHash },
    });

    if (existing) {
      throw new Error(`API key for ${provider} already exists for this organization`);
    }

    const apiKeyEntity = this.apiKeyRepository.create({
      organizationId,
      provider,
      keyHash,
      keyPrefix,
      name: name || `${provider} API Key`,
      isActive: true,
      expiresAt,
    });

    const saved = await this.apiKeyRepository.save(apiKeyEntity);

    this.logger.logWithMetadata(
      'info',
      `API key stored for ${provider}`,
      {
        organizationId,
        provider,
        keyId: saved.id,
      },
      'APIKeyService'
    );

    return saved;
  }

  /**
   * Retrieve API key (returns from config if not in DB, or decrypts if needed)
   */
  async getAPIKey(organizationId: string, provider: string): Promise<string | null> {
    // First check database
    const stored = await this.apiKeyRepository.findOne({
      where: { organizationId, provider, isActive: true },
    });

    if (stored) {
      // Check expiration
      if (stored.expiresAt && stored.expiresAt < new Date()) {
        this.logger.warn(
          `API key expired for ${provider}`,
          'APIKeyService',
          { organizationId, keyId: stored.id }
        );
        return null;
      }

      // Update last used
      stored.lastUsedAt = new Date();
      await this.apiKeyRepository.save(stored);

      // For stored keys, we need to retrieve from secure storage
      // In production, use a key management service (AWS KMS, HashiCorp Vault, etc.)
      // For now, fall back to environment variables
      return this.getAPIKeyFromConfig(provider);
    }

    // Fall back to environment variables
    return this.getAPIKeyFromConfig(provider);
  }

  /**
   * Get API key from environment/config
   */
  private getAPIKeyFromConfig(provider: string): string | null {
    const envKey = this.configService.get<string>(`${provider.toUpperCase()}_API_KEY`);
    return envKey || null;
  }

  /**
   * Hash API key for storage
   */
  private hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Verify API key matches stored hash
   */
  async verifyAPIKey(
    organizationId: string,
    provider: string,
    apiKey: string
  ): Promise<boolean> {
    const keyHash = this.hashAPIKey(apiKey);
    const stored = await this.apiKeyRepository.findOne({
      where: { organizationId, provider, keyHash, isActive: true },
    });

    return !!stored;
  }

  /**
   * List API keys for organization
   */
  async listAPIKeys(organizationId: string): Promise<APIKeyEntity[]> {
    return this.apiKeyRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Deactivate API key
   */
  async deactivateAPIKey(id: string, organizationId: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, organizationId },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);

    this.logger.log(
      `API key deactivated: ${id}`,
      'APIKeyService'
    );
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(id: string, organizationId: string): Promise<void> {
    const result = await this.apiKeyRepository.delete({ id, organizationId });
    if (result.affected === 0) {
      throw new Error('API key not found');
    }

    this.logger.log(
      `API key deleted: ${id}`,
      'APIKeyService'
    );
  }
}

