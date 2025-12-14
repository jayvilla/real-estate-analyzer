# Summary Module - AI-Driven Summaries

This module provides AI-driven summary generation for portfolios, properties, deals, markets, and executive dashboards.

## Features

- **Portfolio Summary Generation**: Comprehensive portfolio performance analysis
- **Property Performance Summaries**: Property-specific metrics and insights
- **Deal Analysis Summaries**: Deal evaluation with recommendations
- **Market Report Generation**: Market trends and predictions
- **Executive Dashboard Summaries**: High-level executive summaries
- **PDF Export**: Professional PDF generation using pdfkit
- **Email Reports**: HTML email generation and delivery
- **Template System**: Customizable summary templates
- **Multi-language Support**: English, Spanish, French, German, Chinese
- **Scheduled Generation**: Automated summary generation and delivery

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@real-estate-analyzer.com

# Test Email (for dev/local environments)
# All emails will be redirected to this address in development
TEST_EMAIL=test@example.com

# Node Environment
NODE_ENV=development  # or 'production', 'local'
```

### Development Email Behavior

In `development` or `local` environments:

1. **All emails are redirected** to the `TEST_EMAIL` address (if configured)
2. **Email logging** shows original recipients for debugging
3. **JSON transport** is used (emails logged as JSON instead of actually sent)

This prevents accidentally sending emails to real users during development.

### Production Email Behavior

In `production` environment:

1. **Emails are sent to actual recipients**
2. **SMTP configuration is required** (SMTP_HOST, SMTP_USER, SMTP_PASS)
3. **Real email delivery** via configured SMTP server

## Usage

### Generate Portfolio Summary

```typescript
const summary = await summaryService.generatePortfolioSummary(
  organizationId,
  {
    type: SummaryType.PORTFOLIO,
    format: SummaryFormat.HTML,
    language: SummaryLanguage.EN,
    period: {
      start: new Date('2024-01-01'),
      end: new Date(),
    },
  }
);
```

### Generate PDF

```typescript
const pdf = await pdfFormatter.generatePDF(summary);
// Returns Buffer that can be sent as response
```

### Send Email Report

```typescript
const emailReport = await emailFormatter.generateEmailReport(
  summary,
  ['recipient@example.com'],
  'Monthly Portfolio Report'
);

await emailFormatter.sendEmail(emailReport);
```

### Schedule Summary Generation

```typescript
const scheduledSummary: ScheduledSummary = {
  id: 'unique-id',
  organizationId: 'org-id',
  userId: 'user-id',
  type: SummaryType.PORTFOLIO,
  format: SummaryFormat.EMAIL,
  language: SummaryLanguage.EN,
  schedule: {
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '09:00',
    timezone: 'America/New_York',
  },
  recipients: ['recipient@example.com'],
  isActive: true,
  nextRun: new Date('2024-02-01T09:00:00'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

schedulerService.scheduleSummary(scheduledSummary);
```

## API Endpoints

- `POST /summary/portfolio` - Generate portfolio summary
- `POST /summary/property/:propertyId` - Generate property summary
- `POST /summary/deal/:dealId` - Generate deal summary
- `POST /summary/market/:zipCode` - Generate market report
- `POST /summary/executive` - Generate executive summary
- `POST /summary/pdf` - Generate PDF from summary
- `POST /summary/email` - Send email report
- `GET /summary/templates` - Get available templates
- `GET /summary/templates/:id` - Get template by ID

## Dependencies

### Required

- `pdfkit` - Already installed for PDF generation
- `@nestjs/config` - Already installed for configuration

### Optional (for full functionality)

```bash
# For email sending
npm install nodemailer @types/nodemailer

# For advanced scheduling
npm install @nestjs/schedule cron
```

## Email Testing in Development

When `NODE_ENV=development` or `NODE_ENV=local`:

1. Set `TEST_EMAIL` in your `.env`:
   ```bash
   TEST_EMAIL=your-test-email@example.com
   ```

2. All emails will be redirected to this address
3. Original recipients are logged for debugging
4. Emails are sent using JSON transport (logged, not actually delivered)

## Example .env Configuration

```bash
# Development
NODE_ENV=development
TEST_EMAIL=dev-test@example.com

# Production
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@real-estate-analyzer.com
```

## Notes

- Email functionality gracefully degrades if nodemailer is not installed
- Scheduling requires @nestjs/schedule and cron packages
- PDF generation uses pdfkit (already installed)
- Templates support variable substitution with `{{variable}}` syntax

