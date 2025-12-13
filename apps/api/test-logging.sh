#!/bin/bash

# Test script for structured logging
# Make sure the API is running on http://localhost:8000

API_URL="http://localhost:8000/api"
CORRELATION_ID="test-$(date +%s)"

echo "🧪 Testing Structured Logging"
echo "================================"
echo ""

echo "1️⃣  Testing Correlation ID (custom):"
echo "   Request ID: $CORRELATION_ID"
curl -X GET "$API_URL/properties" \
  -H "X-Correlation-ID: $CORRELATION_ID" \
  -H "Accept: application/json" \
  -w "\n   Response Status: %{http_code}\n" \
  -s -o /dev/null
echo "   ✅ Check response headers for X-Correlation-ID: $CORRELATION_ID"
echo ""

echo "2️⃣  Testing Correlation ID (auto-generated):"
curl -X GET "$API_URL/properties" \
  -H "Accept: application/json" \
  -w "\n   Response Status: %{http_code}\n" \
  -s -o /dev/null
echo "   ✅ Check response headers for auto-generated X-Correlation-ID"
echo ""

echo "3️⃣  Testing Success Logging (INFO level):"
curl -X GET "$API_URL/properties" \
  -H "Accept: application/json" \
  -s -o /dev/null
echo "   ✅ Check console for INFO level logs"
echo ""

echo "4️⃣  Testing Error Logging (ERROR level):"
curl -X GET "$API_URL/properties/00000000-0000-0000-0000-000000000000" \
  -H "Accept: application/json" \
  -s
echo ""
echo "   ✅ Check console for ERROR level logs with correlation ID"
echo ""

echo "5️⃣  Testing Client Error (WARN level):"
curl -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: warn-test-001" \
  -d '{"invalid": "data"}' \
  -s
echo ""
echo "   ✅ Check console for WARN level logs"
echo ""

echo "6️⃣  Testing Performance Logging:"
curl -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: perf-test-001" \
  -d '{
    "address": "456 Performance Ave",
    "city": "Test City",
    "state": "CA",
    "zipCode": "12345",
    "propertyType": "SINGLE_FAMILY",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1500
  }' \
  -s -o /dev/null
echo "   ✅ Check console for performance metrics"
echo ""

echo "7️⃣  Testing Sensitive Data Redaction:"
curl -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: redact-test-001" \
  -d '{
    "address": "789 Security St",
    "city": "Test City",
    "state": "CA",
    "zipCode": "12345",
    "propertyType": "SINGLE_FAMILY",
    "password": "should-be-redacted",
    "token": "secret-token-123"
  }' \
  -s -o /dev/null
echo "   ✅ Check debug logs - password and token should be [REDACTED]"
echo ""

echo "8️⃣  Testing Service-Level Logging:"
echo "   Creating property..."
PROPERTY_ID=$(curl -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: service-test-001" \
  -d '{
    "address": "321 Service Blvd",
    "city": "Test City",
    "state": "CA",
    "zipCode": "12345",
    "propertyType": "SINGLE_FAMILY"
  }' \
  -s | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$PROPERTY_ID" ]; then
  echo "   ✅ Property created: $PROPERTY_ID"
  echo "   ✅ Check console for PropertyService logs with metadata"
  
  echo "   Fetching property..."
  curl -X GET "$API_URL/properties/$PROPERTY_ID" \
    -H "X-Correlation-ID: service-test-002" \
    -s -o /dev/null
  echo "   ✅ Check console for findOne logs"
  
  echo "   Updating property..."
  curl -X PATCH "$API_URL/properties/$PROPERTY_ID" \
    -H "Content-Type: application/json" \
    -H "X-Correlation-ID: service-test-003" \
    -d '{"bedrooms": 4}' \
    -s -o /dev/null
  echo "   ✅ Check console for update logs with duration"
fi
echo ""

echo "✅ All tests completed!"
echo ""
echo "📋 What to check in console:"
echo "   - Correlation IDs in all log entries"
echo "   - Structured log format (JSON in production, readable in dev)"
echo "   - Performance metrics for slow requests"
echo "   - Error logs with full context"
echo "   - Service-level logs with metadata"
echo "   - Sensitive data redaction in debug logs"

