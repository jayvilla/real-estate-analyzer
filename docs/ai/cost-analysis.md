# AI Service Cost Analysis

## Overview

This document provides comprehensive cost analysis for AI services used in the Real Estate Analyzer platform. It covers cost tracking, optimization strategies, and budget management.

## Cost Structure

### Provider Pricing

#### OpenAI
- **GPT-4 Turbo**: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- **GPT-3.5 Turbo**: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens
- **Embeddings**: $0.0001 per 1K tokens

#### Anthropic (Claude)
- **Claude 3 Opus**: $0.015 per 1K input tokens, $0.075 per 1K output tokens
- **Claude 3 Sonnet**: $0.003 per 1K input tokens, $0.015 per 1K output tokens
- **Claude 3 Haiku**: $0.00025 per 1K input tokens, $0.00125 per 1K output tokens

#### Ollama (Local)
- **Cost**: $0 (runs on local infrastructure)
- **Infrastructure**: Server costs only (CPU/GPU, electricity)

## Cost Tracking

### Automatic Cost Tracking

All AI API calls are automatically tracked with:
- Provider used
- Model used
- Input/output token counts
- Estimated cost
- Feature/endpoint
- User and organization
- Timestamp

### Cost Calculation

```typescript
// Example cost calculation
const inputTokens = 1000;
const outputTokens = 500;
const inputCost = (inputTokens / 1000) * 0.01; // $0.01 per 1K tokens
const outputCost = (outputTokens / 1000) * 0.03; // $0.03 per 1K tokens
const totalCost = inputCost + outputCost; // $0.025
```

### Cost Summary Endpoints

**GET /api/ai-infrastructure/costs/summary**
- Returns total costs by provider, feature, and time period
- Includes token usage statistics
- Supports date range filtering

**GET /api/ai-infrastructure/costs/analytics**
- Detailed analytics by feature
- Success/failure rates
- Average costs per request
- Usage trends

## Cost Optimization Strategies

### 1. Caching

**Impact**: Reduces costs by 60-80% for repeated queries

- LLM responses are cached based on:
  - Query content hash
  - Context (property ID, deal ID, etc.)
  - User preferences

**Cache TTL**:
- Property analysis: 24 hours
- Deal recommendations: 12 hours
- Market commentary: 6 hours
- Portfolio insights: 1 hour

### 2. Model Selection

**Strategy**: Use cheaper models when appropriate

- **High-value operations**: GPT-4 Turbo (property analysis, deal recommendations)
- **Medium-value operations**: GPT-3.5 Turbo (summaries, descriptions)
- **Low-value operations**: Claude Haiku or local Ollama (simple queries)

### 3. Prompt Optimization

**Impact**: Reduces token usage by 20-40%

- Use concise prompts
- Structure data efficiently
- Avoid redundant context
- Use few-shot examples sparingly

### 4. Batch Processing

**Impact**: Reduces API overhead

- Batch similar requests
- Use streaming for long responses
- Implement request queuing

### 5. Rate Limiting

**Impact**: Prevents cost spikes

- Enforce per-organization limits
- Implement user-level quotas
- Monitor and alert on unusual usage

## Cost Estimates by Feature

### Property Analysis
- **Average tokens**: 2,000 input, 1,000 output
- **Cost per request**: $0.05 (GPT-4 Turbo)
- **With caching**: $0.01 (80% cache hit rate)

### Deal Recommendation
- **Average tokens**: 2,500 input, 1,500 output
- **Cost per request**: $0.08 (GPT-4 Turbo)
- **With caching**: $0.016 (80% cache hit rate)

### Natural Language Queries
- **Average tokens**: 500 input, 300 output
- **Cost per request**: $0.01 (GPT-3.5 Turbo)
- **With caching**: $0.002 (80% cache hit rate)

### Portfolio Insights
- **Average tokens**: 3,000 input, 2,000 output
- **Cost per request**: $0.09 (GPT-4 Turbo)
- **With caching**: $0.018 (80% cache hit rate)

### Summary Generation
- **Average tokens**: 4,000 input, 3,000 output
- **Cost per request**: $0.13 (GPT-4 Turbo)
- **With caching**: $0.026 (80% cache hit rate)

## Monthly Cost Projections

### Small Organization (10 users, 100 properties)
- **Property analyses**: 200/month × $0.01 = $2.00
- **Deal recommendations**: 50/month × $0.016 = $0.80
- **NLQ queries**: 500/month × $0.002 = $1.00
- **Summaries**: 20/month × $0.026 = $0.52
- **Total**: ~$4.32/month

### Medium Organization (50 users, 500 properties)
- **Property analyses**: 1,000/month × $0.01 = $10.00
- **Deal recommendations**: 250/month × $0.016 = $4.00
- **NLQ queries**: 2,500/month × $0.002 = $5.00
- **Summaries**: 100/month × $0.026 = $2.60
- **Total**: ~$21.60/month

### Large Organization (200 users, 2,000 properties)
- **Property analyses**: 4,000/month × $0.01 = $40.00
- **Deal recommendations**: 1,000/month × $0.016 = $16.00
- **NLQ queries**: 10,000/month × $0.002 = $20.00
- **Summaries**: 400/month × $0.026 = $10.40
- **Total**: ~$86.40/month

## Cost Monitoring

### Alerts

Set up alerts for:
- Daily cost exceeds threshold
- Unusual usage patterns
- Cost per request increases
- Cache hit rate drops below 70%

### Budget Management

1. **Set monthly budgets** per organization
2. **Implement soft limits** (warnings at 80% of budget)
3. **Enforce hard limits** (block requests at 100% of budget)
4. **Provide cost dashboards** for administrators

## Best Practices

1. **Monitor regularly**: Review costs weekly
2. **Optimize prompts**: Reduce token usage
3. **Use caching**: Enable for all appropriate features
4. **Choose right model**: Match model to use case
5. **Set budgets**: Prevent unexpected costs
6. **Track by feature**: Identify expensive operations
7. **Review analytics**: Understand usage patterns

## Cost Reduction Checklist

- [ ] Enable caching for all AI features
- [ ] Use GPT-3.5 Turbo for non-critical operations
- [ ] Optimize prompts to reduce token usage
- [ ] Implement rate limiting
- [ ] Set up cost alerts
- [ ] Review and optimize expensive features
- [ ] Consider local LLM (Ollama) for development/testing
- [ ] Batch similar requests when possible
- [ ] Monitor cache hit rates
- [ ] Set organization-level budgets

## Questions?

For cost-related questions or optimization strategies, contact the development team or review the API documentation at `/api/docs`.

