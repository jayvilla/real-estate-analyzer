# Testing Structured Logging

## Quick Test Guide

### 1. Start the API Server
```bash
pnpm dev:api
# or
pnpm nx serve api
```

### 2. Test Correlation IDs

#### Test with custom correlation ID:
```bash
curl -X GET http://localhost:8000/api/properties \
  -H "X-Correlation-ID: test-123-abc" \
  -v
```

Check the response headers - you should see:
```
X-Correlation-ID: test-123-abc
```

#### Test without correlation ID (auto-generated):
```bash
curl -X GET http://localhost:8000/api/properties
```

The API will generate a new correlation ID and include it in:
- Response headers (`X-Correlation-ID`)
- All log entries for that request

### 3. Test Structured Logging Output

#### Development Mode (Readable Format)
In development, logs appear as:
```
2025-12-13T14:30:00.000Z INFO [HTTP] [abc-123] Incoming Request: GET /api/properties
```

#### Production Mode (JSON Format)
Set `NODE_ENV=production` to see JSON logs:
```bash
NODE_ENV=production pnpm dev:api
```

Logs will appear as:
```json
{"timestamp":"2025-12-13T14:30:00.000Z","level":"info","message":"Incoming Request: GET /api/properties","context":"HTTP","correlationId":"abc-123",...}
```

### 4. Test Different Log Levels

#### Success Request (INFO level):
```bash
curl -X GET http://localhost:8000/api/properties
```

#### Error Request (ERROR level):
```bash
curl -X GET http://localhost:8000/api/properties/invalid-id
```

#### Client Error (WARN level):
```bash
curl -X POST http://localhost:8000/api/properties \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

### 5. Test Performance Logging

Create a property to see performance metrics:
```bash
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

Check logs for:
- Request duration
- Performance warnings if > 1000ms

### 6. Test Sensitive Data Redaction

Test that passwords/tokens are redacted:
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

Check debug logs - sensitive fields should show as `[REDACTED]`

### 7. Test Error Logging with Correlation IDs

```bash
# This will fail and show error logs with correlation ID
curl -X GET http://localhost:8000/api/properties/non-existent-id \
  -H "X-Correlation-ID: error-test-001" \
  -v
```

Check logs for:
- Full error stack trace
- Correlation ID in error logs
- Error response includes correlation ID

### 8. Test Service-Level Logging

All PropertyService operations now log with metadata:
- `create()` - logs property details, duration
- `findAll()` - logs count, duration
- `findOne()` - logs property ID
- `update()` - logs property ID, duration
- `remove()` - logs property ID, duration

### 9. View Logs in Real-Time

Watch the console output while making requests. You should see:
1. Incoming request logs
2. Service operation logs
3. Outgoing response logs
4. Performance metrics
5. Error details (if any)

### 10. Test Log Levels

Set `LOG_LEVEL=debug` to see debug logs:
```bash
LOG_LEVEL=debug pnpm dev:api
```

Set `LOG_LEVEL=verbose` for even more detail:
```bash
LOG_LEVEL=verbose pnpm dev:api
```

## Expected Log Output Examples

### Successful Request:
```
INFO [HTTP] [correlation-id] Incoming Request: GET /api/properties
DEBUG [PropertyService] Finding all properties
INFO [PropertyService] Retrieved 5 properties - count: 5, duration: 23ms
INFO [HTTP] [correlation-id] Outgoing Response: GET /api/properties 200 - duration: 45ms
```

### Error Request:
```
INFO [HTTP] [correlation-id] Incoming Request: GET /api/properties/invalid-id
DEBUG [PropertyService] Finding property with ID: invalid-id
WARN [PropertyService] Property not found with ID: invalid-id
ERROR [HTTP] [correlation-id] Request Error: GET /api/properties/invalid-id - Property with ID invalid-id not found
ERROR [HttpExceptionFilter] HTTP 404: GET /api/properties/invalid-id - Property with ID invalid-id not found
```

### Slow Request (>1s):
```
INFO [HTTP] [correlation-id] Incoming Request: POST /api/properties
INFO [PropertyService] Creating property at 123 Test St
INFO [PropertyService] Property created successfully - propertyId: xxx, duration: 1200ms
WARN [HTTP] [correlation-id] Performance: POST /api/properties - duration: 1250ms
INFO [HTTP] [correlation-id] Outgoing Response: POST /api/properties 201 - duration: 1250ms
```

