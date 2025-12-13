#!/bin/bash

# Test script for API error standardization
# This script tests various error scenarios to verify standardized error responses

API_URL="http://localhost:8000/api"
CORRELATION_ID="test-$(date +%s)"

echo "🧪 Testing API Error Standardization"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Validation Error (Empty Body)
echo -e "${YELLOW}Test 1: Validation Error (Empty Body)${NC}"
echo "POST $API_URL/properties"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: $CORRELATION_ID-1" \
  -d '{}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "400" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.'
  
  # Verify error structure
  if echo "$body" | jq -e '.errorCode' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Error code present${NC}"
  else
    echo -e "${RED}✗ Error code missing${NC}"
  fi
  
  if echo "$body" | jq -e '.correlationId' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Correlation ID present${NC}"
  else
    echo -e "${RED}✗ Correlation ID missing${NC}"
  fi
else
  echo -e "${RED}✗ Expected 400, got $http_code${NC}"
fi
echo ""

# Test 2: Validation Error (Invalid Data)
echo -e "${YELLOW}Test 2: Validation Error (Invalid Data)${NC}"
echo "POST $API_URL/properties"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: $CORRELATION_ID-2" \
  -d '{
    "address": "",
    "city": "New York",
    "state": "NY",
    "zipCode": "invalid",
    "propertyType": "INVALID_TYPE"
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "400" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.'
  
  if echo "$body" | jq -e '.validationErrors' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Validation errors present${NC}"
    echo "$body" | jq '.validationErrors'
  else
    echo -e "${RED}✗ Validation errors missing${NC}"
  fi
else
  echo -e "${RED}✗ Expected 400, got $http_code${NC}"
fi
echo ""

# Test 3: Property Not Found
echo -e "${YELLOW}Test 3: Property Not Found${NC}"
echo "GET $API_URL/properties/00000000-0000-0000-0000-000000000000"
response=$(curl -s -w "\n%{http_code}" "$API_URL/properties/00000000-0000-0000-0000-000000000000" \
  -H "X-Correlation-ID: $CORRELATION_ID-3")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "404" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.'
  
  if echo "$body" | jq -e '.errorCode == "PROPERTY_NOT_FOUND"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Correct error code${NC}"
  else
    echo -e "${RED}✗ Incorrect error code${NC}"
  fi
else
  echo -e "${RED}✗ Expected 404, got $http_code${NC}"
fi
echo ""

# Test 4: Invalid UUID Format
echo -e "${YELLOW}Test 4: Invalid UUID Format${NC}"
echo "GET $API_URL/properties/invalid-uuid"
response=$(curl -s -w "\n%{http_code}" "$API_URL/properties/invalid-uuid" \
  -H "X-Correlation-ID: $CORRELATION_ID-4")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "400" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Expected 400, got $http_code${NC}"
fi
echo ""

# Test 5: Valid Request (Should Succeed)
echo -e "${YELLOW}Test 5: Valid Request (Should Succeed)${NC}"
echo "POST $API_URL/properties"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: $CORRELATION_ID-5" \
  -d '{
    "address": "123 Test St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "propertyType": "SINGLE_FAMILY",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1500
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ]; then
  echo -e "${GREEN}✓ Status: $http_code (Success)${NC}"
  property_id=$(echo "$body" | jq -r '.id')
  echo "Created property ID: $property_id"
  
  # Test 6: Update Non-Existent Property
  echo ""
  echo -e "${YELLOW}Test 6: Update Non-Existent Property${NC}"
  echo "PATCH $API_URL/properties/00000000-0000-0000-0000-000000000000"
  update_response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/properties/00000000-0000-0000-0000-000000000000" \
    -H "Content-Type: application/json" \
    -H "X-Correlation-ID: $CORRELATION_ID-6" \
    -d '{"address": "Updated Address"}')
  update_http_code=$(echo "$update_response" | tail -n1)
  update_body=$(echo "$update_response" | sed '$d')
  
  if [ "$update_http_code" = "404" ]; then
    echo -e "${GREEN}✓ Status: $update_http_code${NC}"
    echo "$update_body" | jq '.'
  else
    echo -e "${RED}✗ Expected 404, got $update_http_code${NC}"
  fi
else
  echo -e "${RED}✗ Expected 201, got $http_code${NC}"
  echo "$body" | jq '.'
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}✅ Error Standardization Tests Complete${NC}"
echo ""
echo "All error responses should include:"
echo "  - statusCode"
echo "  - errorCode"
echo "  - message"
echo "  - correlationId"
echo "  - timestamp"
echo "  - path"
echo "  - method"
echo "  - validationErrors (when applicable)"

