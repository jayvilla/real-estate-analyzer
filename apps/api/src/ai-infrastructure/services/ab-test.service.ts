import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ABTest, ABTestAssignment } from '@real-estate-analyzer/types';
import { ABTestEntity, ABTestAssignmentEntity } from '../entities/ab-test.entity';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class ABTestService {
  constructor(
    @InjectRepository(ABTestEntity)
    private readonly abTestRepository: Repository<ABTestEntity>,
    @InjectRepository(ABTestAssignmentEntity)
    private readonly assignmentRepository: Repository<ABTestAssignmentEntity>,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Get variant assignment for user (creates assignment if doesn't exist)
   */
  async getVariant(
    testId: string,
    userId: string,
    organizationId: string
  ): Promise<string | null> {
    // Check existing assignment
    const existing = await this.assignmentRepository.findOne({
      where: { userId, testId },
    });

    if (existing) {
      return existing.variantId;
    }

    // Get test
    const test = await this.abTestRepository.findOne({
      where: { id: testId, isActive: true },
    });

    if (!test) {
      return null;
    }

    // Check if test is active
    const now = new Date();
    if (test.startDate > now || (test.endDate && test.endDate < now)) {
      return null;
    }

    // Assign variant based on traffic split
    const variantId = this.assignVariant(test.variants, test.trafficSplit, userId);

    // Save assignment
    const assignment = this.assignmentRepository.create({
      userId,
      organizationId,
      testId,
      variantId,
      assignedAt: new Date(),
    });

    await this.assignmentRepository.save(assignment);

    this.logger.logWithMetadata(
      'info',
      `AB test variant assigned`,
      {
        testId,
        userId,
        variantId,
      },
      'ABTestService'
    );

    return variantId;
  }

  /**
   * Assign variant based on traffic split
   */
  private assignVariant(
    variants: any[],
    trafficSplit: number[],
    userId: string
  ): string {
    // Deterministic assignment based on user ID
    const hash = this.hashString(userId);
    const random = hash % 100;

    let cumulative = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulative += trafficSplit[i];
      if (random < cumulative) {
        return variants[i].id;
      }
    }

    // Fallback to first variant
    return variants[0].id;
  }

  /**
   * Create AB test
   */
  async createABTest(test: Partial<ABTest>): Promise<ABTestEntity> {
    const entity = this.abTestRepository.create(test as ABTestEntity);
    const saved = await this.abTestRepository.save(entity);

    this.logger.log(
      `AB test created: ${saved.name}`,
      'ABTestService'
    );

    return saved;
  }

  /**
   * Get active AB tests
   */
  async getActiveTests(): Promise<ABTestEntity[]> {
    const now = new Date();
    return this.abTestRepository.find({
      where: { isActive: true },
    }).then((tests) =>
      tests.filter(
        (test) => test.startDate <= now && (!test.endDate || test.endDate >= now)
      )
    );
  }

  /**
   * Track metric for AB test
   */
  async trackMetric(
    testId: string,
    variantId: string,
    metric: string,
    value: number,
    userId?: string
  ): Promise<void> {
    // In production, this would store metrics in a separate table
    // For now, we'll just log it
    this.logger.logWithMetadata(
      'info',
      `AB test metric tracked`,
      {
        testId,
        variantId,
        metric,
        value,
        userId,
      },
      'ABTestService'
    );
  }

  /**
   * Hash string for deterministic assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

