import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

@Injectable()
export class StructuredLoggerService implements NestLoggerService {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Formats and outputs structured logs
   */
  private formatLog(
    level: LogLevel,
    message: string,
    context?: string,
    logContext?: LogContext,
    error?: Error
  ): StructuredLog {
    const structuredLog: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(logContext?.correlationId && { correlationId: logContext.correlationId }),
      ...(logContext?.userId && { userId: logContext.userId }),
      ...(logContext?.requestId && { requestId: logContext.requestId }),
      ...(logContext?.duration !== undefined && { duration: logContext.duration }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          ...(error.stack && { stack: error.stack }),
          ...((error as any).code && { code: (error as any).code }),
        },
      }),
      ...(logContext?.metadata && { metadata: logContext.metadata }),
    };

    return structuredLog;
  }

  /**
   * Outputs log in appropriate format (JSON for production, readable for development)
   */
  private outputLog(log: StructuredLog): void {
    if (this.isProduction) {
      // Production: JSON format for log aggregation tools
      console.log(JSON.stringify(log));
    } else {
      // Development: Human-readable format
      const { timestamp, level, message, context, correlationId, ...rest } = log;
      const contextStr = context ? `[${context}]` : '';
      const correlationStr = correlationId ? `[${correlationId}]` : '';
      const prefix = `${timestamp} ${level.toUpperCase()} ${contextStr} ${correlationStr}`.trim();
      
      console.log(`${prefix} ${message}`);
      
      if (Object.keys(rest).length > 0) {
        console.log('  Additional context:', JSON.stringify(rest, null, 2));
      }
    }
  }

  log(message: string, context?: string, logContext?: LogContext): void {
    const structuredLog = this.formatLog(LogLevel.INFO, message, context, logContext);
    this.outputLog(structuredLog);
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    logContext?: LogContext
  ): void {
    const error = trace ? new Error(trace) : undefined;
    const structuredLog = this.formatLog(
      LogLevel.ERROR,
      message,
      context,
      logContext,
      error
    );
    this.outputLog(structuredLog);
  }

  warn(message: string, context?: string, logContext?: LogContext): void {
    const structuredLog = this.formatLog(LogLevel.WARN, message, context, logContext);
    this.outputLog(structuredLog);
  }

  debug(message: string, context?: string, logContext?: LogContext): void {
    if (this.isDevelopment || process.env.LOG_LEVEL === 'debug') {
      const structuredLog = this.formatLog(LogLevel.DEBUG, message, context, logContext);
      this.outputLog(structuredLog);
    }
  }

  verbose(message: string, context?: string, logContext?: LogContext): void {
    if (this.isDevelopment || process.env.LOG_LEVEL === 'verbose') {
      const structuredLog = this.formatLog(LogLevel.VERBOSE, message, context, logContext);
      this.outputLog(structuredLog);
    }
  }

  /**
   * Log with custom metadata
   */
  logWithMetadata(
    level: 'error' | 'warn' | 'info' | 'debug' | 'verbose',
    message: string,
    metadata: Record<string, any>,
    context?: string,
    logContext?: LogContext
  ): void {
    const structuredLog = this.formatLog(
      level as LogLevel,
      message,
      context,
      { ...logContext, metadata },
      undefined
    );
    this.outputLog(structuredLog);
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    context?: string,
    logContext?: LogContext
  ): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    const structuredLog = this.formatLog(
      level,
      `Performance: ${operation}`,
      context,
      { ...logContext, duration, metadata: { operation } }
    );
    this.outputLog(structuredLog);
  }
}

