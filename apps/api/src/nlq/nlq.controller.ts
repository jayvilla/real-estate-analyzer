import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NLQService } from './nlq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  QueryResult,
  QueryHistory,
  QuerySuggestion,
} from '@real-estate-analyzer/types';

@Controller('nlq')
@UseGuards(JwtAuthGuard)
export class NLQController {
  constructor(private readonly nlqService: NLQService) {}

  /**
   * Process natural language query
   */
  @Post('query')
  async processQuery(
    @Body() body: { query: string },
    @Request() req: any
  ): Promise<QueryResult> {
    return this.nlqService.processQuery(
      body.query,
      req.user.id,
      req.user.organizationId
    );
  }

  /**
   * Get query history
   */
  @Get('history')
  async getHistory(
    @Query('limit') limit: string,
    @Request() req: any
  ): Promise<QueryHistory[]> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.nlqService.getHistory(
      req.user.id,
      req.user.organizationId,
      limitNum
    );
  }

  /**
   * Get query suggestions
   */
  @Get('suggestions')
  async getSuggestions(
    @Query('limit') limit: string,
    @Request() req: any
  ): Promise<QuerySuggestion[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.nlqService.getSuggestions(
      req.user.organizationId,
      limitNum
    );
  }
}

