import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { NLQService } from './nlq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  QueryResult,
  QueryHistory,
  QuerySuggestion,
} from '@real-estate-analyzer/types';

@ApiTags('NLQ')
@Controller('nlq')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NLQController {
  constructor(private readonly nlqService: NLQService) {}

  /**
   * Process natural language query
   */
  @Post('query')
  @ApiOperation({
    summary: 'Process natural language query',
    description: `
      Processes a natural language query and returns structured results.
      
      **Supported Query Types:**
      - Search: "Show me all properties in California"
      - Filter: "Properties with cap rate above 8%"
      - Analyze: "What's my average cash-on-cash return?"
      - Compare: "Compare properties by ROI"
      - Calculate: "Calculate total portfolio value"
      - List: "List all deals from last month"
      
      **Query Processing:**
      1. Intent recognition - Determines what the user wants to do
      2. Entity extraction - Identifies properties, deals, metrics, locations, dates
      3. Query conversion - Converts to structured database query
      4. Execution - Runs query and returns formatted results
      
      **Response includes:**
      - Original query
      - Structured query representation
      - Query results
      - Formatted results (human-readable)
      - Execution time
      - Result count
      
      Queries are automatically saved to history for suggestions and analytics.
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query to process',
          example: 'Show me all properties in California with cap rate above 8%',
          minLength: 1,
          maxLength: 500,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Query processed successfully',
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Original query text',
        },
        structuredQuery: {
          type: 'object',
          description: 'Structured query representation',
          properties: {
            intent: {
              type: 'string',
              enum: ['search', 'filter', 'analyze', 'compare', 'calculate', 'list', 'show', 'find'],
            },
            entity: {
              type: 'string',
              enum: ['property', 'deal', 'metric', 'location', 'date', 'number', 'status'],
            },
            filters: {
              type: 'array',
              items: { type: 'object' },
            },
            sort: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                direction: { type: 'string', enum: ['asc', 'desc'] },
              },
            },
            limit: { type: 'number' },
          },
        },
        results: {
          type: 'array',
          description: 'Query results',
          items: { type: 'object' },
        },
        formattedResults: {
          type: 'string',
          description: 'Human-readable formatted results',
        },
        executionTime: {
          type: 'number',
          description: 'Query execution time in milliseconds',
        },
        resultCount: {
          type: 'number',
          description: 'Number of results returned',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query format or missing required fields',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Query processing failed',
  })
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
  @ApiOperation({
    summary: 'Get query history',
    description: `
      Retrieves the user's query history, ordered by most recent first.
      
      **Use Cases:**
      - Display recent queries in UI
      - Allow users to re-run previous queries
      - Analytics and usage tracking
      
      Results are scoped to the authenticated user and their organization.
    `,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of history entries to return (default: 50, max: 100)',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Query history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          query: { type: 'string' },
          structuredQuery: { type: 'object' },
          resultCount: { type: 'number' },
          executionTime: { type: 'number' },
          timestamp: { type: 'string', format: 'date-time' },
          userId: { type: 'string', format: 'uuid' },
          organizationId: { type: 'string', format: 'uuid' },
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Get query suggestions',
    description: `
      Returns suggested queries based on:
      - Popular queries from the organization
      - User's query history
      - Common query patterns
      
      **Use Cases:**
      - Auto-complete in search interface
      - Quick action buttons
      - Onboarding examples
      
      Suggestions are ranked by usage frequency and relevance.
    `,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of suggestions to return (default: 10, max: 50)',
    type: Number,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Query suggestions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Suggested query text',
            example: 'Show me all properties in California',
          },
          intent: {
            type: 'string',
            enum: ['search', 'filter', 'analyze', 'compare', 'calculate', 'list', 'show', 'find'],
          },
          usageCount: {
            type: 'number',
            description: 'Number of times this query has been used',
          },
          lastUsed: {
            type: 'string',
            format: 'date-time',
            description: 'Last time this query was used',
          },
        },
      },
    },
  })
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
