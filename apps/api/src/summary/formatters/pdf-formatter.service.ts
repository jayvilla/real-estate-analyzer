import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { SummaryFormat } from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class PdfFormatterService {
  constructor(private readonly logger: StructuredLoggerService) {}

  /**
   * Generate PDF from summary data
   */
  async generatePDF(summary: any, template?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        this.addContentToPDF(doc, summary);
        doc.end();
      } catch (error) {
        this.logger.error(
          `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
          'PdfFormatterService'
        );
        reject(error);
      }
    });
  }

  /**
   * Add content to PDF document
   */
  private addContentToPDF(doc: PDFDocument, summary: any): void {
    // Title
    doc.fontSize(20).text('Summary Report', { align: 'center' });
    doc.moveDown();

    if (summary.period) {
      doc.fontSize(12).text(
        `Period: ${summary.period.start.toLocaleDateString()} - ${summary.period.end.toLocaleDateString()}`,
        { align: 'center' }
      );
      doc.moveDown();
    }

    // Overview
    if (summary.overview) {
      doc.fontSize(16).text('Overview', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(summary.overview, { align: 'justify' });
      doc.moveDown();
    }

    // Key Metrics
    if (summary.keyMetrics && summary.keyMetrics.length > 0) {
      doc.fontSize(16).text('Key Metrics', { underline: true });
      doc.moveDown(0.5);
      summary.keyMetrics.forEach((metric: any) => {
        doc.fontSize(11)
          .text(`${metric.label}: ${metric.value}`, { indent: 20 })
          .moveDown(0.3);
      });
      doc.moveDown();
    }

    // Portfolio Overview (for executive summaries)
    if (summary.portfolioOverview) {
      doc.fontSize(16).text('Portfolio Overview', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11)
        .text(`Total Properties: ${summary.portfolioOverview.totalProperties}`, { indent: 20 })
        .moveDown(0.3)
        .text(`Total Value: ${summary.portfolioOverview.totalValue}`, { indent: 20 })
        .moveDown(0.3)
        .text(`Total Cash Flow: ${summary.portfolioOverview.totalCashFlow}`, { indent: 20 })
        .moveDown(0.3)
        .text(`Average Cap Rate: ${summary.portfolioOverview.averageCapRate}`, { indent: 20 });
      doc.moveDown();
    }

    // Recommendations
    if (summary.recommendations && summary.recommendations.length > 0) {
      doc.fontSize(16).text('Recommendations', { underline: true });
      doc.moveDown(0.5);
      summary.recommendations.forEach((rec: string) => {
        doc.fontSize(11).text(`• ${rec}`, { indent: 20 }).moveDown(0.3);
      });
      doc.moveDown();
    }

    // Risks
    if (summary.risks && summary.risks.length > 0) {
      doc.fontSize(16).text('Risks', { underline: true });
      doc.moveDown(0.5);
      summary.risks.forEach((risk: string) => {
        doc.fontSize(11).text(`• ${risk}`, { indent: 20 }).moveDown(0.3);
      });
      doc.moveDown();
    }

    // Opportunities
    if (summary.opportunities && summary.opportunities.length > 0) {
      doc.fontSize(16).text('Opportunities', { underline: true });
      doc.moveDown(0.5);
      summary.opportunities.forEach((opp: string) => {
        doc.fontSize(11).text(`• ${opp}`, { indent: 20 }).moveDown(0.3);
      });
      doc.moveDown();
    }

    // Footer
    doc.fontSize(8)
      .text(
        `Generated on ${new Date().toLocaleString()}`,
        { align: 'center' }
      );
  }

  /**
   * Generate PDF from HTML (using puppeteer - if installed)
   */
  async generatePDFFromHTML(html: string): Promise<Buffer> {
    this.logger.warn(
      'HTML to PDF conversion requires puppeteer. Install it for production use.',
      'PdfFormatterService'
    );

    // Placeholder - in production, use puppeteer:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(html);
    // const pdf = await page.pdf({ format: 'A4' });
    // await browser.close();
    // return pdf;

    return Buffer.from(html, 'utf-8');
  }
}

