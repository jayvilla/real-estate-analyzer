# API Error Standardization

This document describes the comprehensive error standardization system implemented in the API.

## Overview

All API errors follow a standardized format that includes:
- HTTP status codes
- Application-specific error codes
- Human-readable messages
- Correlation IDs for request tracking
- Detailed validation errors (when applicable)
- Development-only stack traces

## Error Response Format

All error responses follow this structure:

```json
{
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": "One or more validation errors occurred",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/properties",
  "method": "POST",
  "validationErrors": [
    {
      "field": "address",
      "message": "address should not be empty",
      "value": "",
      "constraints": {
        "isNotEmpty": "address should not be empty"
      }
    }
  ]
}
```

## Error Codes

### Validation Errors (400)
- `VALIDATION_ERROR` - General validation failure
- `INVALID_INPUT` - Invalid input data
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_FORMAT` - Invalid data format
- `BAD_REQUEST` - General bad request
- `INVALID_UUID` - Invalid UUID format
- `INVALID_ENUM_VALUE` - Invalid enum value

### Authentication & Authorization (401, 403)
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized
- `TOKEN_EXPIRED` - Authentication token expired
- `INVALID_CREDENTIALS` - Invalid login credentials

### Not Found (404)
- `RESOURCE_NOT_FOUND` - General resource not found
- `PROPERTY_NOT_FOUND` - Property not found
- `USER_NOT_FOUND` - User not found

### Conflict (409)
- `RESOURCE_CONFLICT` - Resource conflict
- `DUPLICATE_ENTRY` - Duplicate entry

### Rate Limiting (429)
- `RATE_LIMIT_EXCEEDED` - Too many requests

### Server Errors (500)
- `INTERNAL_SERVER_ERROR` - General server error
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External service error

## Custom Exceptions

The API provides custom exception classes for common scenarios:

### PropertyNotFoundException
```typescript
throw new PropertyNotFoundException(propertyId);
```

### ValidationException
```typescript
throw new ValidationException(
  "Validation failed",
  [
    { field: "address", message: "Address is required" }
  ]
);
```

### DatabaseException
```typescript
throw new DatabaseException("Failed to save property", originalError);
```

### ConflictException
```typescript
throw new ConflictException("Property already exists", "address");
```

### BadRequestException
```typescript
throw new BadRequestException("Invalid property type");
```

## Usage in Services

### Example: PropertyService

```typescript
import { PropertyNotFoundException, DatabaseException } from '../common/errors/custom-exceptions';

async findOne(id: string): Promise<PropertyEntity> {
  const property = await this.propertyRepository.findOne({ where: { id } });
  
  if (!property) {
    throw new PropertyNotFoundException(id);
  }
  
  return property;
}
```

## Validation Errors

Validation errors are automatically formatted when using the `ValidationPipe`. The error response includes:

- `validationErrors`: Array of validation errors with:
  - `field`: The field that failed validation
  - `message`: The validation error message
  - `value`: The rejected value
  - `constraints`: All validation constraints that failed

## Correlation IDs

Every error response includes a `correlationId` that:
- Is generated automatically for each request
- Can be provided via `X-Correlation-ID` header
- Is included in all logs and error responses
- Allows tracking requests across services

## Error Logging

All errors are logged with structured logging:
- **4xx errors**: Logged as warnings
- **5xx errors**: Logged as errors with full stack traces
- Includes correlation ID, user ID, request details, and error metadata

## Testing Error Responses

### Test Invalid Property Creation
```bash
curl -X POST http://localhost:8000/api/properties \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test Property Not Found
```bash
curl http://localhost:8000/api/properties/00000000-0000-0000-0000-000000000000
```

### Test Invalid UUID
```bash
curl http://localhost:8000/api/properties/invalid-uuid
```

### Test with Correlation ID
```bash
curl -X POST http://localhost:8000/api/properties \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: my-custom-id" \
  -d '{"address": "123 Main St"}'
```

## Frontend Integration

The frontend can use the shared error types from `@real-estate-analyzer/types`:

```typescript
import { ApiErrorResponse, ErrorCode } from '@real-estate-analyzer/types';

// Handle API errors
try {
  const response = await fetch('/api/properties');
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    console.error(`Error ${error.errorCode}: ${error.message}`);
    
    if (error.validationErrors) {
      // Handle validation errors
      error.validationErrors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
  }
} catch (error) {
  // Handle network errors
}
```

## Best Practices

1. **Use Custom Exceptions**: Always use custom exception classes instead of generic `HttpException`
2. **Include Context**: Provide meaningful error messages and details
3. **Log Errors**: All errors are automatically logged, but add additional context when needed
4. **Handle Validation**: Let the ValidationPipe handle DTO validation automatically
5. **Correlation IDs**: Always include correlation IDs in error responses for debugging

