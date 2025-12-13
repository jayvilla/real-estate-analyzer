import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate and attach correlation IDs to requests.
 * This allows tracking requests across services and logs.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get correlation ID from header or generate new one
    const correlationId =
      req.headers['x-correlation-id']?.toString() || uuidv4();

    // Attach to request object for use in controllers/services
    (req as any).correlationId = correlationId;

    // Set response header so clients can track their requests
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}

