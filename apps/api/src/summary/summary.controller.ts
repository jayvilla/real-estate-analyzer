import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  Request,
  StreamableFile,
  Header,
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
import type { Response } from 'express';
import { SummaryService } from './summary.service';
import { TemplateService } from './templates/template.service';
import { PdfFormatterService } from './formatters/pdf-formatter.service';
import { EmailFormatterService } from './formatters/email-formatter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  SummaryGenerationOptions,
  SummaryType,
  SummaryFormat,
  SummaryLanguage,
  SummaryTemplate,
  PortfolioSummaryReport,
} from '@real-estate-analyzer/types';

@ApiTags('Summary')
@Controller('summary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SummaryController {
  constructor(
    private readonly summaryService: SummaryService,
    private readonly templateService: TemplateService,
    private readonly pdfFormatter: PdfFormatterService,
    private readonly emailFormatter: EmailFormatterService
  ) {}

  /**
   * Generate portfolio summary
   */
  @Post('portfolio')
  @ApiOperation({
    summary: 'Generate AI-powered portfolio summary',
    description: `
      Generates a comprehensive AI-powered summary of the user's entire portfolio.
      
      **Summary Includes:**
      - Portfolio overview and key metrics
      - Performance analysis across all properties
      - Top performing properties
      - Areas for improvement
      - Market insights
      - Recommendations
      
      **Options:**
      - Format: JSON, PDF, HTML, Markdown
      - Language: English, Spanish, French, German, Chinese
      - Template: Custom summary templates
      - Include charts and visualizations
      
      Summaries are cached to optimize performance and reduce costs.
    `,
  })
  @ApiBody({
    description: 'Summary generation options',
    schema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'pdf', 'html', 'markdown'],
          default: 'json',
        },
        language: {
          type: 'string',
          enum: ['en', 'es', 'fr', 'de', 'zh'],
          default: 'en',
        },
        templateId: {
          type: 'string',
          description: 'Optional template ID to use',
        },
        includeCharts: {
          type: 'boolean',
          default: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio summary generated successfully',
  })
  async generatePortfolioSummary(
    @Body() options: SummaryGenerationOptions,
    @Request() req: any
  ) {
    return this.summaryService.generatePortfolioSummary(
      req.user.organizationId,
      options
    );
  }

  /**
   * Generate property performance summary
   */
  @Post('property/:propertyId')
  @ApiOperation({
    summary: 'Generate property performance summary',
    description: `
      Generates an AI-powered summary for a specific property's performance.
      
      **Summary Includes:**
      - Property overview
      - Financial performance metrics
      - Occupancy and rental history
      - Maintenance and expenses
      - Comparison to market averages
      - Recommendations
    `,
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID to generate summary for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Property summary generated successfully',
  })
  async generatePropertySummary(
    @Param('propertyId') propertyId: string,
    @Body() options: SummaryGenerationOptions,
    @Request() req: any
  ) {
    return this.summaryService.generatePropertySummary(
      propertyId,
      req.user.organizationId,
      options
    );
  }

  /**
   * Generate deal analysis summary
   */
  @Post('deal/:dealId')
  @ApiOperation({
    summary: 'Generate deal analysis summary',
    description: `
      Generates an AI-powered summary for a real estate deal analysis.
      
      **Summary Includes:**
      - Deal overview and key terms
      - Financial projections
      - Risk assessment
      - Comparison to similar deals
      - Recommendation (buy/pass/negotiate)
    `,
  })
  @ApiParam({
    name: 'dealId',
    description: 'Deal ID to generate summary for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Deal summary generated successfully',
  })
  async generateDealSummary(
    @Param('dealId') dealId: string,
    @Body() options: SummaryGenerationOptions,
    @Request() req: any
  ) {
    return this.summaryService.generateDealSummary(
      dealId,
      req.user.organizationId,
      options
    );
  }

  /**
   * Generate market report
   */
  @Post('market/:zipCode')
  @ApiOperation({
    summary: 'Generate market report for a location',
    description: `
      Generates an AI-powered market report for a specific zip code.
      
      **Report Includes:**
      - Market overview
      - Price trends and forecasts
      - Inventory levels
      - Rental market analysis
      - Neighborhood insights
      - Investment opportunities
    `,
  })
  @ApiParam({
    name: 'zipCode',
    description: 'Zip code to generate market report for',
    type: String,
    example: '90210',
  })
  @ApiResponse({
    status: 200,
    description: 'Market report generated successfully',
  })
  async generateMarketReport(
    @Param('zipCode') zipCode: string,
    @Body() options: SummaryGenerationOptions,
    @Request() req: any
  ) {
    return this.summaryService.generateMarketReport(
      zipCode,
      req.user.organizationId,
      options
    );
  }

  /**
   * Generate executive dashboard summary
   */
  @Post('executive')
  @ApiOperation({
    summary: 'Generate executive dashboard summary',
    description: `
      Generates a high-level executive summary for portfolio management.
      
      **Summary Includes:**
      - Key performance indicators
      - Portfolio health metrics
      - Top insights and recommendations
      - Risk alerts
      - Growth opportunities
      
      Optimized for executive-level decision making.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Executive summary generated successfully',
  })
  async generateExecutiveSummary(
    @Body() options: SummaryGenerationOptions,
    @Request() req: any
  ) {
    return this.summaryService.generateExecutiveSummary(
      req.user.organizationId,
      options
    );
  }

  /**
   * Generate PDF from summary
   */
  @Post('pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=summary.pdf')
  @ApiOperation({
    summary: 'Generate PDF from summary',
    description: `
      Converts a summary object to a formatted PDF document.
      
      **PDF Features:**
      - Professional formatting
      - Charts and visualizations
      - Branded header/footer
      - Multi-page support
      - Print-ready output
    `,
  })
  @ApiBody({
    description: 'Summary object to convert to PDF',
    schema: {
      type: 'object',
      required: ['summary'],
      properties: {
        summary: {
          type: 'object',
          description: 'Summary object (any summary type)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generatePDF(@Body() body: { summary: any }): Promise<StreamableFile> {
    const pdf = await this.pdfFormatter.generatePDF(body.summary);
    return new StreamableFile(pdf);
  }

  /**
   * Generate and send email report
   */
  @Post('email')
  @ApiOperation({
    summary: 'Generate and send email report',
    description: `
      Generates a summary and sends it via email to specified recipients.
      
      **Email Features:**
      - HTML formatted email
      - PDF attachment option
      - Customizable subject line
      - Multiple recipients
      - Scheduled delivery support
    `,
  })
  @ApiBody({
    description: 'Email report configuration',
    schema: {
      type: 'object',
      required: ['summary', 'recipients'],
      properties: {
        summary: {
          type: 'object',
          description: 'Summary object to send',
        },
        recipients: {
          type: 'array',
          items: { type: 'string', format: 'email' },
          description: 'Email addresses to send report to',
        },
        subject: {
          type: 'string',
          description: 'Email subject line (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async generateEmailReport(
    @Body() body: { summary: any; recipients: string[]; subject?: string },
    @Request() req: any
  ) {
    const emailReport = await this.emailFormatter.generateEmailReport(
      body.summary,
      body.recipients,
      body.subject
    );
    await this.emailFormatter.sendEmail(emailReport);
    return { success: true, message: 'Email sent successfully' };
  }

  /**
   * Get available templates
   */
  @Get('templates')
  @ApiOperation({
    summary: 'Get available summary templates',
    description: `
      Returns list of available summary templates that can be used for generation.
      
      Templates can be filtered by:
      - Type (portfolio, property, deal, market, executive)
      - Format (json, pdf, html, markdown)
      - Language (en, es, fr, de, zh)
    `,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: SummaryType,
    description: 'Filter by summary type',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: SummaryFormat,
    description: 'Filter by format',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: SummaryLanguage,
    description: 'Filter by language',
  })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    type: [Object],
  })
  getTemplates(
    @Query('type') type?: SummaryType,
    @Query('format') format?: SummaryFormat,
    @Query('language') language?: SummaryLanguage
  ): SummaryTemplate[] {
    return this.templateService.getTemplates(type, format, language);
  }

  /**
   * Get template by ID
   */
  @Get('templates/:id')
  @ApiOperation({
    summary: 'Get template by ID',
    description: 'Retrieves a specific summary template by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  getTemplate(@Param('id') id: string): SummaryTemplate | null {
    return this.templateService.getTemplate(id);
  }
}
