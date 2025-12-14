import { Injectable, OnModuleInit, OnModuleDestroy, Optional } from '@nestjs/common';
import { ScheduledSummary } from '@real-estate-analyzer/types';
import { SummaryService } from '../summary.service';
import { EmailFormatterService } from '../formatters/email-formatter.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

/**
 * Scheduler Service for scheduled summary generation
 * Note: For full scheduling support, install @nestjs/schedule and cron:
 * npm install @nestjs/schedule cron
 */
@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private scheduledSummaries: Map<string, ScheduledSummary> = new Map();
  private cronJobs: Map<string, any> = new Map();

  constructor(
    @Optional() private readonly schedulerRegistry: any, // Optional - only if @nestjs/schedule is installed
    private readonly summaryService: SummaryService,
    private readonly emailFormatter: EmailFormatterService,
    private readonly logger: StructuredLoggerService
  ) {}

  onModuleInit() {
    // Load scheduled summaries from database (placeholder)
    this.logger.log('Scheduler service initialized', 'SchedulerService');
  }

  onModuleDestroy() {
    // Clean up all scheduled jobs
    this.scheduledSummaries.forEach((_, id) => {
      this.removeSchedule(id);
    });
  }

  /**
   * Schedule a summary generation
   */
  scheduleSummary(scheduledSummary: ScheduledSummary): void {
    try {
      if (!this.schedulerRegistry) {
        this.logger.warn(
          'SchedulerRegistry not available. Install @nestjs/schedule for full scheduling support.',
          'SchedulerService'
        );
        // Store for manual execution
        this.scheduledSummaries.set(scheduledSummary.id, scheduledSummary);
        return;
      }

      // Try to use CronJob if available (use require with try/catch to avoid webpack errors)
      let CronJob: any;
      try {
        // Use eval to prevent webpack from trying to bundle cron at build time
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        CronJob = new Function('return require("cron").CronJob')();
      } catch {
        this.logger.warn(
          'CronJob not available. Install cron package for scheduling.',
          'SchedulerService'
        );
        this.scheduledSummaries.set(scheduledSummary.id, scheduledSummary);
        return;
      }

      const cronExpression = this.buildCronExpression(scheduledSummary.schedule);
      const job = new CronJob(cronExpression, async () => {
        await this.executeScheduledSummary(scheduledSummary);
      });

      this.schedulerRegistry.addCronJob(scheduledSummary.id, job);
      job.start();

      this.cronJobs.set(scheduledSummary.id, job);
      this.scheduledSummaries.set(scheduledSummary.id, scheduledSummary);

      this.logger.logWithMetadata(
        'info',
        `Summary scheduled`,
        {
          summaryId: scheduledSummary.id,
          type: scheduledSummary.type,
          frequency: scheduledSummary.schedule.frequency,
          nextRun: scheduledSummary.nextRun,
        },
        'SchedulerService'
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SchedulerService',
        { summaryId: scheduledSummary.id }
      );
      throw error;
    }
  }

  /**
   * Remove a scheduled summary
   */
  removeSchedule(summaryId: string): void {
    try {
      if (this.schedulerRegistry && this.schedulerRegistry.doesExist('cron', summaryId)) {
        this.schedulerRegistry.deleteCronJob(summaryId);
      }

      const job = this.cronJobs.get(summaryId);
      if (job) {
        job.stop();
        this.cronJobs.delete(summaryId);
      }

      this.scheduledSummaries.delete(summaryId);

      this.logger.log(
        `Schedule removed: ${summaryId}`,
        'SchedulerService'
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SchedulerService',
        { summaryId }
      );
    }
  }

  /**
   * Execute a scheduled summary
   */
  private async executeScheduledSummary(scheduledSummary: ScheduledSummary): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Executing scheduled summary: ${scheduledSummary.id}`,
        'SchedulerService'
      );

      // Generate summary based on type
      let summary: any;
      const options = {
        type: scheduledSummary.type,
        format: scheduledSummary.format,
        language: scheduledSummary.language,
        templateId: scheduledSummary.templateId,
      };

      switch (scheduledSummary.type) {
        case 'portfolio':
          summary = await this.summaryService.generatePortfolioSummary(
            scheduledSummary.organizationId,
            options
          );
          break;
        case 'executive':
          summary = await this.summaryService.generateExecutiveSummary(
            scheduledSummary.organizationId,
            options
          );
          break;
        // Add other types as needed
        default:
          this.logger.warn(
            `Unknown summary type: ${scheduledSummary.type}`,
            'SchedulerService'
          );
          return;
      }

      // Generate and send email if recipients are specified
      if (scheduledSummary.recipients && scheduledSummary.recipients.length > 0) {
        const emailReport = await this.emailFormatter.generateEmailReport(
          summary,
          scheduledSummary.recipients
        );
        await this.emailFormatter.sendEmail(emailReport);
      }

      // Update last run time
      scheduledSummary.lastRun = new Date();
      scheduledSummary.nextRun = this.calculateNextRun(scheduledSummary.schedule);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Scheduled summary executed successfully`,
        {
          summaryId: scheduledSummary.id,
          duration,
          recipients: scheduledSummary.recipients?.length || 0,
        },
        'SchedulerService'
      );
    } catch (error) {
      this.logger.error(
        `Failed to execute scheduled summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SchedulerService',
        { summaryId: scheduledSummary.id }
      );
    }
  }

  /**
   * Build cron expression from schedule
   */
  private buildCronExpression(schedule: ScheduledSummary['schedule']): string {
    const [hours, minutes] = schedule.time.split(':').map(Number);

    switch (schedule.frequency) {
      case 'daily':
        return `${minutes} ${hours} * * *`; // Every day at specified time
      case 'weekly':
        const dayOfWeek = schedule.dayOfWeek || 0;
        return `${minutes} ${hours} * * ${dayOfWeek}`; // Weekly on specified day
      case 'monthly':
        const dayOfMonth = schedule.dayOfMonth || 1;
        return `${minutes} ${hours} ${dayOfMonth} * *`; // Monthly on specified day
      case 'quarterly':
        // First day of quarter months (Jan, Apr, Jul, Oct)
        return `${minutes} ${hours} 1 1,4,7,10 *`;
      default:
        throw new Error(`Unknown frequency: ${schedule.frequency}`);
    }
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(schedule: ScheduledSummary['schedule']): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const nextRun = new Date();

    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        const dayOfWeek = schedule.dayOfWeek || 0;
        const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7 || 7;
        nextRun.setDate(now.getDate() + daysUntilNext);
        break;
      case 'monthly':
        const dayOfMonth = schedule.dayOfMonth || 1;
        nextRun.setDate(dayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      case 'quarterly':
        const quarterMonths = [1, 4, 7, 10];
        const currentMonth = now.getMonth() + 1;
        let nextQuarterMonth = quarterMonths.find((m) => m > currentMonth);
        if (!nextQuarterMonth) {
          nextQuarterMonth = quarterMonths[0];
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        nextRun.setMonth(nextQuarterMonth - 1);
        nextRun.setDate(1);
        break;
    }

    return nextRun;
  }
}

