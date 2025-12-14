# Valuation Module Testing Guide

This guide explains how to test the valuation module and derived metrics endpoints.

## Prerequisites

1. **Database Migration**: Ensure the deals table is created
   ```bash
   pnpm db:migrate:deals
   ```

2. **API Running**: Start the API server
   ```bash
   pnpm dev:api
   ```

## Automated Testing

Run the comprehensive test script:

```bash
pnpm test:valuation
```

This script tests:
- Property and Deal creation
- Complete deal valuation
- Individual metrics (NOI, Cash Flow, Cap Rate, Returns)
- Property valuation summaries
- Property-Deal relationships
- Error handling

## Manual Testing

### 1. Create a Property

```bash
curl -X POST http://localhost:8000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Investment St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "propertyType": "SINGLE_FAMILY",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1500,
    "currentValue": 850000
  }'
```

### 2. Create a Deal

```bash
curl -X POST http://localhost:8000/api/deals \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "<property-id-from-step-1>",
    "purchasePrice": 750000,
    "purchaseDate": "2024-01-15",
    "closingCosts": 15000,
    "rehabCosts": 25000,
    "loanType": "CONVENTIONAL",
    "downPaymentPercent": 20,
    "interestRate": 6.5,
    "loanTerm": 360,
    "monthlyRentalIncome": 4500,
    "monthlyExpenses": 800,
    "vacancyRate": 5,
    "propertyManagementRate": 10,
    "insurance": 150,
    "propertyTax": 600,
    "capExReserve": 300,
    "status": "CLOSED"
  }'
```

### 3. Get Complete Deal Valuation

```bash
curl http://localhost:8000/api/valuation/deals/<deal-id>
```

**Response includes:**
- Purchase details
- NOI breakdown
- Cash flow (monthly & annual)
- Cap rate
- Return metrics (ROI, cash-on-cash, DSCR, GRM)
- Break-even occupancy
- Expense ratios

### 4. Get Specific Metrics

**NOI:**
```bash
curl http://localhost:8000/api/valuation/deals/<deal-id>/metrics?type=noi
```

**Cash Flow:**
```bash
curl http://localhost:8000/api/valuation/deals/<deal-id>/metrics?type=cashflow
```

**Cap Rate:**
```bash
curl http://localhost:8000/api/valuation/deals/<deal-id>/metrics?type=caprate
```

**Returns:**
```bash
curl http://localhost:8000/api/valuation/deals/<deal-id>/metrics?type=returns
```

**All Metrics:**
```bash
curl http://localhost:8000/api/valuation/deals/<deal-id>/metrics
```

### 5. Get Property Valuation Summary

```bash
curl http://localhost:8000/api/valuation/properties/<property-id>
```

**Response includes:**
- Total deals count
- Active deals count
- Average cap rate (across all deals)
- Average cash-on-cash return
- Total cash invested
- Total annual cash flow
- Individual deal valuations

### 6. Get Property with Deals

```bash
curl "http://localhost:8000/api/properties/<property-id>?includeDeals=true"
```

**Response includes:**
- Property details
- Associated deals array

### 7. Get All Properties with Deals

```bash
curl "http://localhost:8000/api/properties?includeDeals=true"
```

## Expected Calculations

### Example Deal:
- Purchase Price: $750,000
- Down Payment: 20% = $150,000
- Loan Amount: $600,000
- Interest Rate: 6.5%
- Loan Term: 360 months
- Monthly Rent: $4,500
- Monthly Expenses: $800
- Vacancy Rate: 5%
- Property Management: 10%

### Expected Results:

**NOI:**
- Annual Gross Income: $4,500 × 12 = $54,000
- Vacancy Loss (5%): $2,700
- Effective Gross Income: $51,300
- Operating Expenses: $800 × 12 = $9,600 + management fee
- NOI: ~$46,170

**Debt Service:**
- Monthly Payment: ~$3,791
- Annual Payment: ~$45,492

**Cash Flow:**
- Annual: NOI - Debt Service = ~$678
- Monthly: ~$56.50

**Cap Rate:**
- Cap Rate = (NOI / Property Value) × 100
- = ($46,170 / $850,000) × 100 = ~5.43%

**Cash-on-Cash Return:**
- Total Cash Invested: $150,000 + $15,000 + $25,000 = $190,000
- Cash-on-Cash = (Annual Cash Flow / Total Cash Invested) × 100
- = ($678 / $190,000) × 100 = ~0.36%

**DSCR:**
- DSCR = NOI / Debt Service
- = $46,170 / $45,492 = ~1.02

## Error Scenarios

### Invalid Deal ID
```bash
curl http://localhost:8000/api/valuation/deals/00000000-0000-0000-0000-000000000000
```
Expected: 404 Not Found

### Invalid Metric Type
```bash
curl http://localhost:8000/api/valuation/deals/<deal-id>/metrics?type=invalid
```
Expected: 404 Not Found

### Property Without Deals
```bash
curl http://localhost:8000/api/valuation/properties/<property-id-without-deals>
```
Expected: 200 OK with empty deals array

## Notes

- All calculations are rounded to 2 decimal places
- NOI is capped at 0 (cannot be negative)
- Property management fee is calculated on effective gross income
- Debt service uses standard mortgage amortization formula
- Multiple deals on a property are aggregated for property-level metrics

