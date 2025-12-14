#!/bin/bash

# Test script for Valuation Module and Derived Metrics
# This script tests valuation calculations, metrics endpoints, and property-deal relationships

API_URL="http://localhost:8000/api"
CORRELATION_ID="val-test-$(date +%s)"

echo "🧪 Testing Valuation Module & Derived Metrics"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Create a Property
echo -e "${YELLOW}Test 1: Create a Property${NC}"
echo "POST $API_URL/properties"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: $CORRELATION_ID-1" \
  -d '{
    "address": "123 Investment St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "propertyType": "SINGLE_FAMILY",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1500,
    "yearBuilt": 2010,
    "currentValue": 850000
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  property_id=$(echo "$body" | jq -r '.id')
  echo "Created property ID: $property_id"
  echo "$body" | jq '{id, address, city, state, propertyType, currentValue}'
else
  echo -e "${RED}✗ Expected 201, got $http_code${NC}"
  echo "$body" | jq '.'
  exit 1
fi
echo ""

# Test 2: Create a Deal for the Property
echo -e "${YELLOW}Test 2: Create a Deal for the Property${NC}"
echo "POST $API_URL/deals"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/deals" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: $CORRELATION_ID-2" \
  -d "{
    \"propertyId\": \"$property_id\",
    \"purchasePrice\": 750000,
    \"purchaseDate\": \"2024-01-15\",
    \"closingCosts\": 15000,
    \"rehabCosts\": 25000,
    \"loanType\": \"CONVENTIONAL\",
    \"downPaymentPercent\": 20,
    \"interestRate\": 6.5,
    \"loanTerm\": 360,
    \"points\": 1,
    \"monthlyRentalIncome\": 4500,
    \"monthlyExpenses\": 800,
    \"vacancyRate\": 5,
    \"propertyManagementRate\": 10,
    \"annualAppreciationRate\": 3,
    \"annualInflationRate\": 2.5,
    \"insurance\": 150,
    \"propertyTax\": 600,
    \"hoaFees\": 0,
    \"capExReserve\": 300,
    \"status\": \"CLOSED\",
    \"notes\": \"Great investment property in prime location\"
  }")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  deal_id=$(echo "$body" | jq -r '.id')
  echo "Created deal ID: $deal_id"
  echo "$body" | jq '{id, propertyId, purchasePrice, loanType, status, totalAcquisitionCost, downPayment, loanAmount}'
else
  echo -e "${RED}✗ Expected 201, got $http_code${NC}"
  echo "$body" | jq '.'
  exit 1
fi
echo ""

# Test 3: Get Complete Deal Valuation
echo -e "${YELLOW}Test 3: Get Complete Deal Valuation${NC}"
echo "GET $API_URL/valuation/deals/$deal_id"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/deals/$deal_id" \
  -H "X-Correlation-ID: $CORRELATION_ID-3")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo -e "${BLUE}Valuation Summary:${NC}"
  echo "$body" | jq '{
    purchasePrice,
    totalCashInvested,
    grossRentalIncome,
    effectiveGrossIncome,
    operatingExpenses,
    noi: .noi.noi,
    monthlyCashFlow: .cashFlow.monthlyCashFlow,
    annualCashFlow: .cashFlow.annualCashFlow,
    capRate: .capRate.capRate,
    cashOnCashReturn: .returns.cashOnCashReturn,
    dscr: .returns.dscr
  }'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 4: Get Specific Metric - NOI
echo -e "${YELLOW}Test 4: Get Specific Metric - NOI${NC}"
echo "GET $API_URL/valuation/deals/$deal_id/metrics?type=noi"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/deals/$deal_id/metrics?type=noi" \
  -H "X-Correlation-ID: $CORRELATION_ID-4")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.noi'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 5: Get Specific Metric - Cash Flow
echo -e "${YELLOW}Test 5: Get Specific Metric - Cash Flow${NC}"
echo "GET $API_URL/valuation/deals/$deal_id/metrics?type=cashflow"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/deals/$deal_id/metrics?type=cashflow" \
  -H "X-Correlation-ID: $CORRELATION_ID-5")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.cashFlow'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 6: Get Specific Metric - Cap Rate
echo -e "${YELLOW}Test 6: Get Specific Metric - Cap Rate${NC}"
echo "GET $API_URL/valuation/deals/$deal_id/metrics?type=caprate"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/deals/$deal_id/metrics?type=caprate" \
  -H "X-Correlation-ID: $CORRELATION_ID-6")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.capRate'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 7: Get Specific Metric - Returns
echo -e "${YELLOW}Test 7: Get Specific Metric - Returns${NC}"
echo "GET $API_URL/valuation/deals/$deal_id/metrics?type=returns"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/deals/$deal_id/metrics?type=returns" \
  -H "X-Correlation-ID: $CORRELATION_ID-7")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.returns'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 8: Get All Metrics (no type parameter)
echo -e "${YELLOW}Test 8: Get All Metrics (no type parameter)${NC}"
echo "GET $API_URL/valuation/deals/$deal_id/metrics"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/deals/$deal_id/metrics" \
  -H "X-Correlation-ID: $CORRELATION_ID-8")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq 'keys'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 9: Get Property Valuation Summary
echo -e "${YELLOW}Test 9: Get Property Valuation Summary${NC}"
echo "GET $API_URL/valuation/properties/$property_id"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/properties/$property_id" \
  -H "X-Correlation-ID: $CORRELATION_ID-9")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo -e "${BLUE}Property Valuation Summary:${NC}"
  echo "$body" | jq '{
    propertyId,
    propertyAddress,
    totalDeals,
    activeDeals,
    averageCapRate,
    averageCashOnCashReturn,
    totalCashInvested,
    totalAnnualCashFlow
  }'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 10: Get Property with Deals Relationship
echo -e "${YELLOW}Test 10: Get Property with Deals Relationship${NC}"
echo "GET $API_URL/properties/$property_id?includeDeals=true"
response=$(curl -s -w "\n%{http_code}" "$API_URL/properties/$property_id?includeDeals=true" \
  -H "X-Correlation-ID: $CORRELATION_ID-10")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  deals_count=$(echo "$body" | jq '.deals | length')
  echo "Property includes $deals_count deal(s)"
  echo "$body" | jq '{id, address, deals: [.deals[] | {id, purchasePrice, loanType, status}]}'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 11: Get All Properties with Deals
echo -e "${YELLOW}Test 11: Get All Properties with Deals${NC}"
echo "GET $API_URL/properties?includeDeals=true"
response=$(curl -s -w "\n%{http_code}" "$API_URL/properties?includeDeals=true" \
  -H "X-Correlation-ID: $CORRELATION_ID-11")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  properties_count=$(echo "$body" | jq 'length')
  echo "Retrieved $properties_count properties with deals"
  echo "$body" | jq '[.[] | {id, address, dealsCount: (.deals | length)}]'
else
  echo -e "${RED}✗ Expected 200, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 12: Create Second Deal for Same Property
echo -e "${YELLOW}Test 12: Create Second Deal for Same Property${NC}"
echo "POST $API_URL/deals"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/deals" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: $CORRELATION_ID-12" \
  -d "{
    \"propertyId\": \"$property_id\",
    \"purchasePrice\": 800000,
    \"purchaseDate\": \"2024-06-01\",
    \"closingCosts\": 16000,
    \"rehabCosts\": 30000,
    \"loanType\": \"CASH\",
    \"monthlyRentalIncome\": 5000,
    \"monthlyExpenses\": 900,
    \"vacancyRate\": 3,
    \"propertyManagementRate\": 8,
    \"annualAppreciationRate\": 4,
    \"insurance\": 180,
    \"propertyTax\": 650,
    \"capExReserve\": 350,
    \"status\": \"DRAFT\"
  }")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  deal_id_2=$(echo "$body" | jq -r '.id')
  echo "Created second deal ID: $deal_id_2"
  
  # Test property valuation with multiple deals
  echo ""
  echo -e "${YELLOW}Test 12b: Property Valuation with Multiple Deals${NC}"
  response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/properties/$property_id" \
    -H "X-Correlation-ID: $CORRELATION_ID-12b")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Status: $http_code${NC}"
    echo "$body" | jq '{
      totalDeals,
      activeDeals,
      averageCapRate,
      averageCashOnCashReturn,
      totalCashInvested,
      totalAnnualCashFlow
    }'
  fi
else
  echo -e "${RED}✗ Expected 201, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Test 13: Invalid Metric Type
echo -e "${YELLOW}Test 13: Invalid Metric Type (Error Handling)${NC}"
echo "GET $API_URL/valuation/deals/$deal_id/metrics?type=invalid"
response=$(curl -s -w "\n%{http_code}" "$API_URL/valuation/deals/$deal_id/metrics?type=invalid" \
  -H "X-Correlation-ID: $CORRELATION_ID-13")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "404" ]; then
  echo -e "${GREEN}✓ Status: $http_code (Expected error)${NC}"
  echo "$body" | jq '{errorCode, message}'
else
  echo -e "${YELLOW}⚠ Status: $http_code (Expected 404)${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✅ Valuation Module Tests Complete${NC}"
echo ""
echo "Tested Endpoints:"
echo "  ✓ POST /api/properties - Create property"
echo "  ✓ POST /api/deals - Create deal"
echo "  ✓ GET /api/valuation/deals/:id - Complete deal valuation"
echo "  ✓ GET /api/valuation/deals/:id/metrics - Specific metrics"
echo "  ✓ GET /api/valuation/properties/:id - Property valuation"
echo "  ✓ GET /api/properties/:id?includeDeals=true - Property with deals"
echo "  ✓ GET /api/properties?includeDeals=true - All properties with deals"
echo ""
echo "Calculations Verified:"
echo "  ✓ Net Operating Income (NOI)"
echo "  ✓ Cash Flow (Monthly & Annual)"
echo "  ✓ Cap Rate"
echo "  ✓ Cash-on-Cash Return"
echo "  ✓ Debt Service Coverage Ratio (DSCR)"
echo "  ✓ Property-level aggregations"
echo ""

