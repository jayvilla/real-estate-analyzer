import { Injectable } from '@nestjs/common';
import { Summary, EmailReportOptions } from '@real-estate-analyzer/types';
import { PDFGenerationService } from './pdf-generation.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly pdfService: PDFGenerationService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Generate email report
   * Note: This is a placeholder implementation. In production, integrate with
   * an email service like SendGrid, AWS SES, or Nodemailer.
   */
  async generateEmailReport(options: EmailReportOptions): Promise<void> {
    const startTime = Date.now();

    try {
      // Generate email content
      const emailContent = this.generateEmailContent(options.summary);

      // Generate PDF attachment if requested
      let pdfBuffer: Buffer | null = null;
      if (options.includeAttachments) {
        pdfBuffer = await this.pdfService.generatePDF(options.summary);
      }

      // In production, send email using your email service
      // For now, we'll just log it
      this.logger.logWithMetadata(
        'info',
        `Email report generated`,
        {
          recipient: options.recipient,
          subject: options.subject || this.getDefaultSubject(options.summary),
          hasAttachment: !!pdfBuffer,
          attachmentSize: pdfBuffer?.length || 0,
        },
        'EmailService'
      );

      // TODO: Integrate with actual email service
      // await this.sendEmail({
      //   to: options.recipient,
      //   subject: options.subject || this.getDefaultSubject(options.summary),
      //   html: emailContent.html,
      //   text: emailContent.text,
      //   attachments: pdfBuffer ? [{
      //     filename: `summary-${options.summary.id}.pdf`,
      //     content: pdfBuffer,
      //   }] : [],
      // });

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Email report sent`,
        {
          recipient: options.recipient,
          duration,
        },
        'EmailService'
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate email report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'EmailService'
      );
      throw error;
    }
  }

  /**
   * Generate email content from summary
   */
  private generateEmailContent(summary: Summary): { html: string; text: string } {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; color: #4CAF50; margin-bottom: 10px; }
            .metric { margin: 5px 0; }
            .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.getSummaryTitle(summary)}</h1>
            <p>Generated: ${new Date(summary.generatedAt).toLocaleString()}</p>
          </div>
          <div class="content">
            ${this.generateSummaryHTML(summary)}
          </div>
          <div class="footer">
            <p>This is an automated report from Real Estate Analyzer</p>
          </div>
        </body>
      </html>
    `;

    const text = this.generateSummaryText(summary);

    return { html, text };
  }

  /**
   * Generate HTML content from summary
   */
  private generateSummaryHTML(summary: Summary): string {
    let html = `<div class="section"><p>${(summary as any).summary || ''}</p></div>`;

    if ('highlights' in summary && summary.highlights) {
      html += `<div class="section">
        <div class="section-title">Key Highlights</div>
        <ul>${summary.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
      </div>`;
    }

    if ('metrics' in summary && summary.metrics) {
      html += `<div class="section">
        <div class="section-title">Key Metrics</div>
        ${summary.metrics.map((m) => `<div class="metric"><strong>${m.label}:</strong> ${m.value}${m.change ? ` (${m.change})` : ''}</div>`).join('')}
      </div>`;
    }

    if ('recommendations' in summary && summary.recommendations) {
      html += `<div class="section">
        <div class="section-title">Recommendations</div>
        <ul>${summary.recommendations.map((r) => `<li>${r}</li>`).join('')}</ul>
      </div>`;
    }

    return html;
  }

  /**
   * Generate plain text content from summary
   */
  private generateSummaryText(summary: Summary): string {
    let text = `${this.getSummaryTitle(summary)}\n`;
    text += `Generated: ${new Date(summary.generatedAt).toLocaleString()}\n\n`;
    text += `${(summary as any).summary || ''}\n\n`;

    if ('highlights' in summary && summary.highlights) {
      text += `Key Highlights:\n`;
      summary.highlights.forEach((h) => {
        text += `- ${h}\n`;
      });
      text += '\n';
    }

    if ('recommendations' in summary && summary.recommendations) {
      text += `Recommendations:\n`;
      summary.recommendations.forEach((r) => {
        text += `- ${r}\n`;
      });
    }

    return text;
  }

  /**
   * Get summary title
   */
  private getSummaryTitle(summary: Summary): string {
    switch (summary.type) {
      case 'portfolio':
        return 'Portfolio Summary';
      case 'property':
        return 'Property Performance Summary';
      case 'deal':
        return 'Deal Analysis Summary';
      case 'market':
        return 'Market Report';
      case 'executive':
        return 'Executive Summary';
      default:
        return 'Summary Report';
    }
  }

  /**
   * Get default email subject
   */
  private getDefaultSubject(summary: Summary): string {
    return `${this.getSummaryTitle(summary)} - ${new Date(summary.generatedAt).toLocaleDateString()}`;
  }
}

