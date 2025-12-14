import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledSummaryEntity } from '../entities/scheduled-summary.entity';
import { SummaryGenerationService } from './summary-generation.service';
import { EmailService } from './email-service.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';
import { SummaryOptions } from '@real-estate-analyzer/types';

@Injectable()
export class ScheduledSummaryService {
  constructor(
    @InjectRepository(ScheduledSummaryEntity)
    private readonly scheduledSummaryRepository: Repository<ScheduledSummaryEntity>,
    private readonly summaryGeneration: SummaryGenerationService,
    private readonly emailService: EmailService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Create scheduled summary
   */
  async createScheduledSummary(
    name: string,
    options: SummaryOptions,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
      timezone: string;
    },
    emailRecipients: string[],
    organizationId: string,
    userId: string
  ): Promise<ScheduledSummaryEntity> {
    const nextRun = this.calculateNextRun(schedule);

    const scheduled = this.scheduledSummaryRepository.create({
      name,
      options,
      schedule,
      emailRecipients,
      enabled: true,
      nextRun,
      organizationId,
      userId,
    });

    const saved = await this.scheduledSummaryRepository.save(scheduled);

    this.logger.logWithMetadata(
      'info',
      `Scheduled summary created`,
      {
        id: saved.id,
        name,
        frequency: schedule.frequency,
        nextRun: saved.nextRun.toISOString(),
      },
      'ScheduledSummaryService'
    );

    return saved;
  }

  /**
   * Update scheduled summary
   */
  async updateScheduledSummary(
    id: string,
    updates: Partial<{
      name: string;
      options: SummaryOptions;
      schedule: any;
      emailRecipients: string[];
      enabled: boolean;
    }>
  ): Promise<ScheduledSummaryEntity> {
    const scheduled = await this.scheduledSummaryRepository.findOne({
      where: { id },
    });

    if (!scheduled) {
      throw new Error(`Scheduled summary not found: ${id}`);
    }

    if (updates.schedule) {
      scheduled.nextRun = this.calculateNextRun(updates.schedule);
    }

    Object.assign(scheduled, updates);
    const saved = await this.scheduledSummaryRepository.save(scheduled);

    this.logger.logWithMetadata(
      'info',
      `Scheduled summary updated`,
      {
        id: saved.id,
      },
      'ScheduledSummaryService'
    );

    return saved;
  }

  /**
   * Delete scheduled summary
   */
  async deleteScheduledSummary(id: string): Promise<void> {
    await this.scheduledSummaryRepository.delete(id);

    this.logger.logWithMetadata(
      'info',
      `Scheduled summary deleted`,
      {
        id,
      },
      'ScheduledSummaryService'
    );
  }

  /**
   * Get scheduled summaries for organization
   */
  async getScheduledSummaries(organizationId: string): Promise<ScheduledSummaryEntity[]> {
    return this.scheduledSummaryRepository.find({
      where: { organizationId },
      order: { nextRun: 'ASC' },
    });
  }

  /**
   * Cron job to process scheduled summaries
   * Runs every hour to check for summaries that need to be generated
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledSummaries(): Promise<void> {
    const now = new Date();

    const dueSummaries = await this.scheduledSummaryRepository.find({
      where: {
        enabled: true,
        nextRun: LessThanOrEqual(now),
      },
    });

    this.logger.logWithMetadata(
      'info',
      `Processing ${dueSummaries.length} scheduled summaries`,
      {
        count: dueSummaries.length,
      },
      'ScheduledSummaryService'
    );

    for (const scheduled of dueSummaries) {
      try {
        await this.executeScheduledSummary(scheduled);
      } catch (error) {
        this.logger.error(
          `Failed to execute scheduled summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
          'ScheduledSummaryService',
          { id: scheduled.id }
        );
      }
    }
  }

  /**
   * Execute a scheduled summary
   */
  private async executeScheduledSummary(scheduled: ScheduledSummaryEntity): Promise<void> {
    const startTime = Date.now();

    try {
      // Generate summary
      const summary = await this.summaryGeneration.generateSummary(
        scheduled.options,
        scheduled.organizationId,
        scheduled.userId
      );

      // Send email reports
      for (const recipient of scheduled.emailRecipients) {
        await this.emailService.generateEmailReport({
          recipient,
          summary,
          includeAttachments: true,
        });
      }

      // Update next run time
      scheduled.lastRun = new Date();
      scheduled.nextRun = this.calculateNextRun(scheduled.schedule);
      await this.scheduledSummaryRepository.save(scheduled);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Scheduled summary executed successfully`,
        {
          id: scheduled.id,
          duration,
          recipients: scheduled.emailRecipients.length,
        },
        'ScheduledSummaryService'
      );
    } catch (error) {
      this.logger.error(
        `Failed to execute scheduled summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'ScheduledSummaryService',
        { id: scheduled.id }
      );
      throw error;
    }
  }

  /**
   * Calculate next run time based on schedule
   */
  private calculateNextRun(schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
  }): Date {
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const now = new Date();

    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        const currentDay = now.getDay();
        const targetDay = schedule.dayOfWeek ?? 0;

        if (currentDay < targetDay || (currentDay === targetDay && nextRun <= now)) {
          const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
          nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        } else {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;

      case 'monthly':
        const targetDayOfMonth = schedule.dayOfMonth ?? 1;
        nextRun.setDate(targetDayOfMonth);

        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }

    return nextRun;
  }
}

