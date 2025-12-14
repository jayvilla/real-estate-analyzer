import { Injectable } from '@nestjs/common';
import {
  SummaryTemplate,
  SummaryType,
  SummaryFormat,
  SummaryLanguage,
} from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

@Injectable()
export class TemplateService {
  private templates: Map<string, SummaryTemplate> = new Map();

  constructor(private readonly logger: StructuredLoggerService) {
    this.initializeDefaultTemplates();
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): SummaryTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get templates by type and format
   */
  getTemplates(
    type?: SummaryType,
    format?: SummaryFormat,
    language?: SummaryLanguage
  ): SummaryTemplate[] {
    let filtered = Array.from(this.templates.values());

    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }

    if (format) {
      filtered = filtered.filter((t) => t.format === format);
    }

    if (language) {
      filtered = filtered.filter((t) => t.language === language);
    }

    return filtered;
  }

  /**
   * Render template with data
   */
  renderTemplate(template: SummaryTemplate, data: any): string {
    let rendered = template.template;

    // Replace variables in template
    for (const variable of template.variables) {
      const value = this.getNestedValue(data, variable);
      const placeholder = `{{${variable}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }

    return rendered;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Portfolio Summary Template (English, HTML)
    this.templates.set('portfolio-html-en', {
      id: 'portfolio-html-en',
      name: 'Portfolio Summary (HTML, English)',
      type: SummaryType.PORTFOLIO,
      format: SummaryFormat.HTML,
      language: SummaryLanguage.EN,
      template: `
        <h1>Portfolio Summary</h1>
        <p><strong>Period:</strong> {{period.start}} to {{period.end}}</p>
        <div class="overview">{{overview}}</div>
        <h2>Key Metrics</h2>
        <ul>
          {{#keyMetrics}}
          <li><strong>{{label}}:</strong> {{value}} {{#change}}({{change}}){{/change}}</li>
          {{/keyMetrics}}
        </ul>
        <h2>Top Performers</h2>
        <ul>
          {{#topPerformers}}
          <li>{{name}}: {{metric}} = {{value}}</li>
          {{/topPerformers}}
        </ul>
        <h2>Recommendations</h2>
        <ul>
          {{#recommendations}}
          <li>{{.}}</li>
          {{/recommendations}}
        </ul>
      `,
      variables: ['overview', 'keyMetrics', 'topPerformers', 'recommendations', 'period'],
      isDefault: true,
    });

    // Executive Summary Template (English, Text)
    this.templates.set('executive-text-en', {
      id: 'executive-text-en',
      name: 'Executive Summary (Text, English)',
      type: SummaryType.EXECUTIVE,
      format: SummaryFormat.TEXT,
      language: SummaryLanguage.EN,
      template: `
EXECUTIVE DASHBOARD SUMMARY
Period: {{period.start}} to {{period.end}}

{{executiveSummary}}

PORTFOLIO OVERVIEW
- Total Properties: {{portfolioOverview.totalProperties}}
- Total Value: {{portfolioOverview.totalValue}}
- Total Cash Flow: {{portfolioOverview.totalCashFlow}}
- Average Cap Rate: {{portfolioOverview.averageCapRate}}

PERFORMANCE
{{#performance}}
- {{metric}}: {{value}} {{#target}}(Target: {{target}}){{/target}} [{{status}}]
{{/performance}}

HIGHLIGHTS
{{#highlights}}
- {{.}}
{{/highlights}}

CONCERNS
{{#concerns}}
- {{.}}
{{/concerns}}

STRATEGIC RECOMMENDATIONS
{{#strategicRecommendations}}
- {{.}}
{{/strategicRecommendations}}
      `,
      variables: ['executiveSummary', 'portfolioOverview', 'performance', 'highlights', 'concerns', 'strategicRecommendations', 'period'],
      isDefault: true,
    });

    // Deal Analysis Template (English, Markdown)
    this.templates.set('deal-markdown-en', {
      id: 'deal-markdown-en',
      name: 'Deal Analysis (Markdown, English)',
      type: SummaryType.DEAL,
      format: SummaryFormat.MARKDOWN,
      language: SummaryLanguage.EN,
      template: `
# Deal Analysis Summary

## Overview
{{overview}}

## Deal Details
- **Property Address:** {{dealDetails.propertyAddress}}
- **Purchase Price:** {{dealDetails.purchasePrice}}
- **Down Payment:** {{dealDetails.downPayment}}
- **Loan Amount:** {{dealDetails.loanAmount}}

## Financial Metrics
- **Cap Rate:** {{financialMetrics.capRate}}
- **Cash-on-Cash Return:** {{financialMetrics.cashOnCash}}
- **DSCR:** {{financialMetrics.dscr}}
- **Monthly Cash Flow:** {{financialMetrics.monthlyCashFlow}}
- **Annual Cash Flow:** {{financialMetrics.annualCashFlow}}

## Risk Assessment
**Level:** {{riskAssessment.level}}

**Factors:**
{{#riskAssessment.factors}}
- {{.}}
{{/riskAssessment.factors}}

## Recommendation
**Verdict:** {{recommendation.verdict}}
**Confidence:** {{recommendation.confidence}}%

{{recommendation.reasoning}}

## Next Steps
{{#nextSteps}}
- {{.}}
{{/nextSteps}}
      `,
      variables: ['overview', 'dealDetails', 'financialMetrics', 'riskAssessment', 'recommendation', 'nextSteps'],
      isDefault: true,
    });

    this.logger.log('Default summary templates initialized', 'TemplateService');
  }
}

