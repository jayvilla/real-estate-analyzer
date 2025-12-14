# Prompt Engineering Documentation

## Overview

This document provides comprehensive guidance on prompt engineering for AI features in the Real Estate Analyzer platform. It covers prompt design principles, best practices, and examples for each AI feature.

## Prompt Design Principles

### 1. Clarity and Specificity

**Good**: "Analyze this property's investment potential, focusing on cap rate, cash-on-cash return, and location factors."

**Bad**: "Tell me about this property."

### 2. Context Provision

Always include relevant context:
- Property/deal details
- Market conditions
- Portfolio context
- User preferences

### 3. Structured Output

Request structured responses:
- Use JSON format when possible
- Specify required fields
- Define response structure

### 4. Few-Shot Examples

Provide examples when appropriate:
- Show desired output format
- Demonstrate analysis depth
- Guide response style

### 5. Constraint Definition

Set clear constraints:
- Response length
- Focus areas
- Excluded topics
- Format requirements

## Property Analysis Prompts

### Base Prompt Structure

```
You are an expert real estate investment analyst. Analyze the following property and provide a comprehensive investment analysis.

Property Details:
- Address: {address}
- Type: {propertyType}
- Bedrooms: {bedrooms}
- Bathrooms: {bathrooms}
- Square Feet: {squareFeet}
- Purchase Price: ${purchasePrice}
- Current Rent: ${rentalIncome}

Financial Metrics:
- Cap Rate: {capRate}%
- Cash-on-Cash Return: {cashOnCash}%
- DSCR: {dscr}

Market Context:
- City: {city}
- State: {state}
- Zip Code: {zipCode}
- Market Trends: {marketTrends}

Portfolio Context:
- Total Properties: {totalProperties}
- Average Cap Rate: {avgCapRate}%
- Geographic Distribution: {distribution}

Please provide analysis in the following JSON format:
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "investmentPotential": "high|medium|low",
  "recommendations": ["rec1", "rec2"],
  "riskFactors": ["risk1", "risk2"],
  "marketPositioning": "analysis text"
}
```

### Optimization Tips

1. **Include Comparable Data**: Add market averages for comparison
2. **Specify Analysis Depth**: Request detailed or summary analysis
3. **Focus Areas**: Emphasize specific aspects (financial, location, etc.)
4. **Risk Emphasis**: Request detailed risk assessment

## Deal Recommendation Prompts

### Base Prompt Structure

```
You are a real estate deal analyst. Evaluate the following deal and provide a recommendation.

Deal Details:
- Property: {propertyAddress}
- Purchase Price: ${purchasePrice}
- Financing: {financingDetails}
- Assumptions: {assumptions}

Financial Analysis:
- Cap Rate: {capRate}%
- Cash-on-Cash: {cashOnCash}%
- DSCR: {dscr}
- NOI: ${noi}
- Cash Flow: ${cashFlow}

Market Analysis:
- Location: {location}
- Market Trends: {trends}
- Comparable Properties: {comparables}

Portfolio Fit:
- Current Portfolio: {portfolioSummary}
- Diversification: {diversification}

Provide recommendation in JSON format:
{
  "recommendation": "buy|pass|negotiate",
  "confidence": 0.0-1.0,
  "keyFactors": ["factor1", "factor2"],
  "suggestedNegotiationPoints": ["point1", "point2"],
  "expectedReturns": {
    "year1": {value},
    "year5": {value},
    "year10": {value}
  },
  "riskAssessment": "low|medium|high"
}
```

### Key Considerations

1. **Financial Focus**: Emphasize quantitative analysis
2. **Market Context**: Include current market conditions
3. **Portfolio Fit**: Consider existing portfolio
4. **Risk-Benefit**: Balance risk and return

## Risk Assessment Prompts

### Base Prompt Structure

```
Analyze the investment risk for the following property/deal.

Property/Deal: {details}
Financial Metrics: {metrics}
Market Conditions: {market}
Location Factors: {location}
Operational Factors: {operational}

Provide comprehensive risk assessment:
{
  "overallRisk": "low|medium|high|critical",
  "riskFactors": [
    {
      "category": "financial|market|location|operational",
      "severity": "low|medium|high",
      "description": "risk description",
      "mitigation": "mitigation strategy"
    }
  ],
  "mitigationStrategies": ["strategy1", "strategy2"],
  "riskScore": 0-100
}
```

## Natural Language Query Prompts

### Query Understanding

```
Parse the following natural language query and extract:
1. Intent (search, filter, analyze, compare, calculate, list)
2. Entities (properties, deals, metrics, locations, dates)
3. Filters and conditions
4. Sort preferences
5. Aggregations needed

Query: "{userQuery}"

Return structured query representation.
```

### Response Formatting

```
Format the following query results in a natural, human-readable way.

Query: "{originalQuery}"
Results: {queryResults}
Result Count: {count}
Execution Time: {time}ms

Provide formatted output that:
- Summarizes results clearly
- Highlights key findings
- Uses natural language
- Includes relevant metrics
```

## Portfolio Insights Prompts

### Base Prompt Structure

```
Analyze the following real estate portfolio and provide strategic insights.

Portfolio Overview:
- Total Properties: {count}
- Total Value: ${value}
- Geographic Distribution: {distribution}
- Property Types: {types}

Performance Metrics:
- Average Cap Rate: {avgCapRate}%
- Average Cash-on-Cash: {avgCoC}%
- Total Cash Flow: ${cashFlow}
- Portfolio ROI: {roi}%

Market Context:
- Primary Markets: {markets}
- Market Trends: {trends}

Provide insights in JSON format:
{
  "insights": ["insight1", "insight2"],
  "strengths": ["strength1", "strength2"],
  "opportunities": ["opp1", "opp2"],
  "risks": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"],
  "diversificationScore": 0-100,
  "growthPotential": "high|medium|low"
}
```

## Summary Generation Prompts

### Portfolio Summary

```
Generate a comprehensive portfolio summary for a real estate investment portfolio.

Portfolio Data: {portfolioData}
Time Period: {period}
Format: {format}
Language: {language}

Include:
1. Executive overview
2. Key performance metrics
3. Top performing properties
4. Areas for improvement
5. Market insights
6. Recommendations

Use professional, clear language suitable for {audience}.
```

### Property Summary

```
Generate a property performance summary.

Property: {propertyData}
Performance Metrics: {metrics}
Time Period: {period}

Include:
1. Property overview
2. Financial performance
3. Occupancy and rental history
4. Expenses and maintenance
5. Market comparison
6. Recommendations

Format: {format}
Language: {language}
```

## Prompt Optimization Techniques

### 1. Token Reduction

**Before** (verbose):
```
Please analyze this property in great detail, considering all possible factors including but not limited to location, financial metrics, market conditions, and investment potential.
```

**After** (concise):
```
Analyze property investment potential. Focus: location, financials, market conditions.
```

### 2. Structure Enhancement

Use clear sections:
```
## Property Analysis

### Financial Metrics
{metrics}

### Location Analysis
{location}

### Market Context
{market}
```

### 3. Example-Driven

Include examples:
```
Provide analysis similar to:
Example: "Property shows strong cap rate (8.5%) but location risk (high crime area). Recommendation: negotiate price reduction."
```

### 4. Constraint Setting

Set boundaries:
```
Provide analysis in exactly 5 strengths, 3 weaknesses, and 3 recommendations. Keep each item to one sentence.
```

## Testing and Iteration

### Prompt Testing Process

1. **Initial Draft**: Create base prompt
2. **Test with Sample Data**: Run with known properties/deals
3. **Evaluate Output**: Check quality, completeness, format
4. **Iterate**: Refine based on results
5. **A/B Test**: Compare prompt variations
6. **Deploy**: Use best-performing version

### Evaluation Criteria

- **Accuracy**: Correct analysis and recommendations
- **Completeness**: All required information included
- **Format**: Proper JSON structure
- **Relevance**: Focused on key factors
- **Clarity**: Easy to understand

## Best Practices

### Do's

✅ Be specific and clear
✅ Provide relevant context
✅ Request structured output
✅ Include examples when helpful
✅ Set appropriate constraints
✅ Test and iterate
✅ Monitor performance

### Don'ts

❌ Use vague language
❌ Overload with unnecessary context
❌ Request unstructured output
❌ Skip testing
❌ Ignore user feedback
❌ Use overly complex prompts
❌ Forget to specify format

## Prompt Templates

### Quick Reference

**Property Analysis**:
```
Analyze {property} for investment potential. Include: strengths, weaknesses, recommendations, risk factors. Format: JSON.
```

**Deal Recommendation**:
```
Evaluate {deal}. Recommendation: buy/pass/negotiate. Include: confidence, key factors, negotiation points. Format: JSON.
```

**Risk Assessment**:
```
Assess risk for {property/deal}. Include: overall risk, risk factors, mitigation strategies. Format: JSON.
```

**Portfolio Insights**:
```
Analyze portfolio: {summary}. Provide: insights, opportunities, risks, recommendations. Format: JSON.
```

## Version Control

- **Version prompts**: Track prompt changes
- **A/B testing**: Compare prompt variations
- **Performance metrics**: Monitor prompt effectiveness
- **Documentation**: Keep prompt docs updated

## Questions?

For prompt engineering questions or optimization help, contact the development team or review the codebase at `apps/api/src/llm/prompts/`.

