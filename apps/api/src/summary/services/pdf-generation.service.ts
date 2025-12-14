import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Summary, SummaryType } from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class PDFGenerationService {
  constructor(private readonly logger: StructuredLoggerService) {}

  /**
   * Generate PDF from summary
   */
  async generatePDF(summary: Summary): Promise<Buffer> {
    const startTime = Date.now();

    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'LETTER',
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // Generate PDF content based on summary type
      switch (summary.type) {
        case SummaryType.PORTFOLIO:
          this.generatePortfolioPDF(doc, summary as any);
          break;
        case SummaryType.PROPERTY:
          this.generatePropertyPDF(doc, summary as any);
          break;
        case SummaryType.DEAL:
          this.generateDealPDF(doc, summary as any);
          break;
        case SummaryType.MARKET:
          this.generateMarketPDF(doc, summary as any);
          break;
        case SummaryType.EXECUTIVE:
          this.generateExecutivePDF(doc, summary as any);
          break;
        default:
          this.generateGenericPDF(doc, summary);
      }

      doc.end();

      // Wait for PDF to be generated
      await new Promise<void>((resolve) => {
        doc.on('end', () => {
          resolve();
        });
      });

      const pdfBuffer = Buffer.concat(chunks);
      const duration = Date.now() - startTime;

      this.logger.logWithMetadata(
        'info',
        `PDF generated successfully`,
        {
          type: summary.type,
          size: pdfBuffer.length,
          duration,
        },
        'PDFGenerationService'
      );

      return pdfBuffer;
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'PDFGenerationService'
      );
      throw error;
    }
  }

  /**
   * Generate portfolio PDF
   */
  private generatePortfolioPDF(doc: PDFDocument, summary: any): void {
    doc.fontSize(20).text('Portfolio Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Generated: ${new Date(summary.generatedAt).toLocaleString()}`);
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Executive Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(summary.summary, { align: 'justify' });
    doc.moveDown(2);

    // Highlights
    if (summary.highlights && summary.highlights.length > 0) {
      doc.fontSize(14).text('Key Highlights', { underline: true });
      doc.moveDown();
      summary.highlights.forEach((highlight: string) => {
        doc.fontSize(11).text(`• ${highlight}`);
      });
      doc.moveDown(2);
    }

    // Metrics
    if (summary.metrics && summary.metrics.length > 0) {
      doc.fontSize(14).text('Key Metrics', { underline: true });
      doc.moveDown();
      summary.metrics.forEach((metric: any) => {
        doc.fontSize(11).text(`${metric.label}: ${metric.value}${metric.change ? ` (${metric.change})` : ''}`);
      });
      doc.moveDown(2);
    }

    // Recommendations
    if (summary.recommendations && summary.recommendations.length > 0) {
      doc.fontSize(14).text('Recommendations', { underline: true });
      doc.moveDown();
      summary.recommendations.forEach((rec: string) => {
        doc.fontSize(11).text(`• ${rec}`);
      });
    }
  }

  /**
   * Generate property PDF
   */
  private generatePropertyPDF(doc: PDFDocument, summary: any): void {
    doc.fontSize(20).text('Property Performance Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Generated: ${new Date(summary.generatedAt).toLocaleString()}`);
    doc.moveDown(2);

    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(summary.summary, { align: 'justify' });
    doc.moveDown(2);

    if (summary.performance) {
      doc.fontSize(14).text('Performance Metrics', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(`Period: ${summary.performance.period}`);
      doc.text(`Cash Flow: $${summary.performance.cashFlow?.toLocaleString() || '0'}`);
      doc.text(`Appreciation: ${summary.performance.appreciation?.toFixed(2) || '0'}%`);
      doc.text(`ROI: ${summary.performance.roi?.toFixed(2) || '0'}%`);
      doc.text(`Cap Rate: ${summary.performance.capRate?.toFixed(2) || '0'}%`);
      doc.moveDown(2);
    }

    if (summary.highlights && summary.highlights.length > 0) {
      doc.fontSize(14).text('Highlights', { underline: true });
      doc.moveDown();
      summary.highlights.forEach((highlight: string) => {
        doc.fontSize(11).text(`• ${highlight}`);
      });
      doc.moveDown(2);
    }

    if (summary.recommendations && summary.recommendations.length > 0) {
      doc.fontSize(14).text('Recommendations', { underline: true });
      doc.moveDown();
      summary.recommendations.forEach((rec: string) => {
        doc.fontSize(11).text(`• ${rec}`);
      });
    }
  }

  /**
   * Generate deal PDF
   */
  private generateDealPDF(doc: PDFDocument, summary: any): void {
    doc.fontSize(20).text('Deal Analysis Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Generated: ${new Date(summary.generatedAt).toLocaleString()}`);
    doc.moveDown(2);

    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(summary.summary, { align: 'justify' });
    doc.moveDown(2);

    if (summary.financials) {
      doc.fontSize(14).text('Financial Metrics', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(`Purchase Price: $${summary.financials.purchasePrice?.toLocaleString() || '0'}`);
      doc.text(`Down Payment: $${summary.financials.downPayment?.toLocaleString() || '0'}`);
      doc.text(`Monthly Cash Flow: $${summary.financials.monthlyCashFlow?.toLocaleString() || '0'}`);
      doc.text(`Cap Rate: ${summary.financials.capRate?.toFixed(2) || '0'}%`);
      doc.text(`Cash-on-Cash Return: ${summary.financials.cashOnCashReturn?.toFixed(2) || '0'}%`);
      doc.text(`DSCR: ${summary.financials.dscr?.toFixed(2) || 'N/A'}`);
      doc.moveDown(2);
    }

    if (summary.strengths && summary.strengths.length > 0) {
      doc.fontSize(14).text('Strengths', { underline: true });
      doc.moveDown();
      summary.strengths.forEach((strength: string) => {
        doc.fontSize(11).text(`• ${strength}`);
      });
      doc.moveDown(2);
    }

    if (summary.recommendations && summary.recommendations.length > 0) {
      doc.fontSize(14).text('Recommendations', { underline: true });
      doc.moveDown();
      summary.recommendations.forEach((rec: string) => {
        doc.fontSize(11).text(`• ${rec}`);
      });
    }
  }

  /**
   * Generate market PDF
   */
  private generateMarketPDF(doc: PDFDocument, summary: any): void {
    doc.fontSize(20).text('Market Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Location: ${summary.zipCode}`);
    doc.text(`Generated: ${new Date(summary.generatedAt).toLocaleString()}`);
    doc.moveDown(2);

    doc.fontSize(14).text('Market Analysis', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(summary.summary, { align: 'justify' });
    doc.moveDown(2);

    if (summary.marketTrends) {
      doc.fontSize(14).text('Market Trends', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(`Trend: ${summary.marketTrends.trend}`);
      doc.text(`Price Change: ${summary.marketTrends.priceChange?.toFixed(2) || '0'}%`);
      doc.text(`Inventory: ${summary.marketTrends.inventory || 'N/A'}`);
      doc.text(`Days on Market: ${summary.marketTrends.daysOnMarket || 'N/A'}`);
      doc.moveDown(2);
    }

    if (summary.insights && summary.insights.length > 0) {
      doc.fontSize(14).text('Key Insights', { underline: true });
      doc.moveDown();
      summary.insights.forEach((insight: string) => {
        doc.fontSize(11).text(`• ${insight}`);
      });
    }
  }

  /**
   * Generate executive PDF
   */
  private generateExecutivePDF(doc: PDFDocument, summary: any): void {
    doc.fontSize(20).text('Executive Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Generated: ${new Date(summary.generatedAt).toLocaleString()}`);
    doc.moveDown(2);

    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(summary.summary, { align: 'justify' });
    doc.moveDown(2);

    if (summary.keyMetrics && summary.keyMetrics.length > 0) {
      doc.fontSize(14).text('Key Metrics', { underline: true });
      doc.moveDown();
      summary.keyMetrics.forEach((metric: any) => {
        doc.fontSize(11).text(`${metric.label}: ${metric.value}${metric.change ? ` (${metric.change})` : ''}`);
      });
      doc.moveDown(2);
    }

    if (summary.strategicRecommendations && summary.strategicRecommendations.length > 0) {
      doc.fontSize(14).text('Strategic Recommendations', { underline: true });
      doc.moveDown();
      summary.strategicRecommendations.forEach((rec: string) => {
        doc.fontSize(11).text(`• ${rec}`);
      });
    }
  }

  /**
   * Generate generic PDF
   */
  private generateGenericPDF(doc: PDFDocument, summary: Summary): void {
    doc.fontSize(20).text('Summary Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Generated: ${new Date(summary.generatedAt).toLocaleString()}`);
    doc.moveDown(2);

    // Try to extract summary text from any summary type
    if ('summary' in summary) {
      doc.fontSize(14).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text((summary as any).summary, { align: 'justify' });
    }
  }
}

