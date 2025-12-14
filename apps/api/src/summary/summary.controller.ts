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

@Controller('summary')
@UseGuards(JwtAuthGuard)
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
  async generatePDF(@Body() body: { summary: any }): Promise<StreamableFile> {
    const pdf = await this.pdfFormatter.generatePDF(body.summary);
    return new StreamableFile(pdf);
  }

  /**
   * Generate and send email report
   */
  @Post('email')
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
  getTemplate(@Param('id') id: string): SummaryTemplate | null {
    return this.templateService.getTemplate(id);
  }
}

