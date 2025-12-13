# Quick Testing Guide for Structured Logging

## 🚀 Quick Start

### 1. Start the API
```bash
pnpm dev:api
```

### 2. Run Automated Tests
```bash
pnpm test:logging
```

This will run all test scenarios and show you what to check in the console.

---

## 📝 Manual Testing

### Test 1: Correlation IDs
```bash
# With custom correlation ID
curl -X GET http://localhost:8000/api/properties \
  -H "X-Correlation-ID: my-test-123" \
  -v

# Check response headers for: X-Correlation-ID: my-test-123
# Check console logs - correlation ID should appear in all log entries
```

### Test 2: Structured Logs (Development Mode)
Look at your console output. You should see:
```
2025-12-13T14:30:00.000Z INFO [HTTP] [abc-123] Incoming Request: GET /api/properties
```

### Test 3: Structured Logs (Production Mode)
```bash
NODE_ENV=production pnpm dev:api
```

Now logs will be JSON:
```json
{"timestamp":"...","level":"info","message":"Incoming Request: GET /api/properties","correlationId":"abc-123",...}
```

### Test 4: Error Logging
```bash
# This will generate a 404 error
curl -X GET http://localhost:8000/api/properties/invalid-id \
  -H "X-Correlation-ID: error-test-001"
```

**Check console for:**
- ERROR level log with correlation ID
- Full error stack trace
- Error response includes correlation ID

### Test 5: Performance Logging
```bash
# Create a property (should complete quickly)
curl -X POST http://localhost:8000/api/properties \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: perf-test-001" \
  -d '{
    "address": "123 Test St",
    "city": "Test City",
    "state": "CA",
    "zipCode": "12345",
    "propertyType": "SINGLE_FAMILY"
  }'
```

**Check console for:**
- Request duration in logs
- Service-level performance metrics
- If > 1000ms, you'll see a WARN log

### Test 6: Sensitive Data Redaction
```bash
curl -X POST http://localhost:8000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Test St",
    "city": "Test City",
    "state": "CA",
    "zipCode": "12345",
    "propertyType": "SINGLE_FAMILY",
    "password": "secret123",
    "token": "abc123"
  }'
```

**Check debug logs** (if LOG_LEVEL=debug):
- `password` and `token` fields should show as `[REDACTED]`

---

## 🔍 What to Look For

### ✅ Success Indicators:

1. **Correlation IDs everywhere:**
   - In response headers
   - In all log entries
   - In error responses

2. **Structured format:**
   - Development: Human-readable with timestamps
   - Production: JSON format

3. **Performance metrics:**
   - Duration in milliseconds
   - Warnings for slow requests (>1s)

4. **Error context:**
   - Full stack traces
   - Correlation IDs in error logs
   - Error details in metadata

5. **Service logs:**
   - PropertyService operations logged
   - Metadata (property IDs, counts, etc.)
   - Duration tracking

---

## 🐛 Troubleshooting

### No correlation IDs in logs?
- Make sure `CorrelationIdMiddleware` is applied (check `app.module.ts`)
- Restart the API server

### Logs not structured?
- Check `NODE_ENV` - should be `production` for JSON logs
- Development mode shows readable format (this is correct)

### No performance warnings?
- Requests need to take > 1000ms to trigger warnings
- Check that duration is being logged

### Sensitive data not redacted?
- Redaction only happens in debug logs
- Set `LOG_LEVEL=debug` to see request body logs

---

## 📊 Example Log Output

### Successful Request Flow:
```
INFO [HTTP] [corr-123] Incoming Request: GET /api/properties
DEBUG [PropertyService] Finding all properties
INFO [PropertyService] Retrieved 5 properties - count: 5, duration: 23ms
INFO [HTTP] [corr-123] Outgoing Response: GET /api/properties 200 - duration: 45ms
```

### Error Request Flow:
```
INFO [HTTP] [corr-456] Incoming Request: GET /api/properties/invalid-id
DEBUG [PropertyService] Finding property with ID: invalid-id
WARN [PropertyService] Property not found with ID: invalid-id
ERROR [HTTP] [corr-456] Request Error: GET /api/properties/invalid-id - Property with ID invalid-id not found
ERROR [HttpExceptionFilter] HTTP 404: GET /api/properties/invalid-id - Property with ID invalid-id not found
```

