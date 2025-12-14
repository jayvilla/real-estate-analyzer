# Event-Driven Architecture Testing Guide

This guide explains how to test the event-driven architecture, saga workflows, and idempotent processing.

## Prerequisites

1. **API Running**: Start the API server
   ```bash
   pnpm dev:api
   ```

2. **Database**: Ensure database is running and migrated
   ```bash
   pnpm db:up
   pnpm db:migrate
   pnpm db:migrate:deals
   ```

## Automated Testing

Run the comprehensive test script:

```bash
pnpm test:events
```

This script tests:
- Property creation event flow
- Deal creation event flow
- Deal update event flow (with and without financial changes)
- Idempotent processing
- Property-Deal relationships
- Valuation recalculation triggers

## Manual Testing

### 1. Test Property Creation Event Flow

**Create a property:**
```bash
curl -X POST http://localhost:8000/api/properties \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test-123" \
  -d '{
    "address": "123 Test St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "propertyType": "SINGLE_FAMILY",
    "currentValue": 850000
  }'
```

**Expected Events:**
1. `PropertyCreatedEvent` emitted
2. `PropertyCreatedHandler` processes event
3. `ValuationRequestedEvent` emitted automatically
4. `ValuationSaga` workflow starts
5. Check API logs for event processing

**Check Logs:**
Look for log entries like:
```
[PropertyCreatedHandler] Handling PropertyCreated event for property {id}
[PropertyCreatedHandler] Triggered initial valuation request
[ValuationSaga] Starting valuation workflow for property {id}
```

### 2. Test Deal Creation Event Flow

**Create a deal:**
```bash
curl -X POST http://localhost:8000/api/deals \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test-456" \
  -d '{
    "propertyId": "<property-id>",
    "purchasePrice": 750000,
    "purchaseDate": "2024-01-15",
    "loanType": "CONVENTIONAL",
    "downPaymentPercent": 20,
    "interestRate": 6.5,
    "loanTerm": 360,
    "monthlyRentalIncome": 4500,
    "monthlyExpenses": 800,
    "status": "CLOSED"
  }'
```

**Expected Events:**
1. `DealCreatedEvent` emitted
2. `DealCreatedHandler` processes event
3. `ValuationRecalculationRequestedEvent` emitted
4. `ValuationRecalculationHandler` recalculates valuation
5. `ValuationCompletedEvent` emitted

**Check Logs:**
Look for:
```
[DealCreatedHandler] Handling DealCreated event for deal {id}
[DealCreatedHandler] Triggered valuation recalculation
[ValuationRecalculationHandler] Handling valuation recalculation
[ValuationRecalculationHandler] Valuation recalculation completed
```

### 3. Test Deal Update Event Flow

**Update deal with financial changes:**
```bash
curl -X PATCH http://localhost:8000/api/deals/<deal-id> \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test-789" \
  -d '{
    "monthlyRentalIncome": 5000,
    "interestRate": 6.0
  }'
```

**Expected Events:**
1. `DealUpdatedEvent` emitted (with previous values)
2. `DealUpdatedHandler` detects financial changes
3. `ValuationRecalculationRequestedEvent` emitted
4. Valuation recalculated

**Update deal without financial changes:**
```bash
curl -X PATCH http://localhost:8000/api/deals/<deal-id> \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated notes",
    "status": "UNDER_CONTRACT"
  }'
```

**Expected Behavior:**
- `DealUpdatedEvent` emitted
- `DealUpdatedHandler` detects NO financial changes
- NO `ValuationRecalculationRequestedEvent` emitted
- Log message: "no financial changes detected, skipping recalculation"

### 4. Test Idempotency

**Retry the same operation:**
```bash
# Create a deal
curl -X POST http://localhost:8000/api/deals ... (same payload)

# If the same event ID is processed twice, you should see:
# [DealCreatedHandler] DealCreated event already processed: {eventId}
```

**Expected Behavior:**
- Event handlers check if event was already processed
- If processed, handler logs warning and returns early
- No duplicate work is performed
- Safe to retry operations

### 5. Verify Correlation IDs

All events should include the correlation ID from the original request:

**Check logs for correlation ID consistency:**
```
[PropertyCreatedHandler] correlationId: test-123
[ValuationRequestedEvent] correlationId: test-123
[ValuationSaga] correlationId: test-123
```

All events in the same request chain should have the same correlation ID.

## What to Look For in Logs

### Successful Event Processing

```
[PropertyCreatedHandler] Handling PropertyCreated event for property {id}
[PropertyCreatedHandler] Event marked as processed: {eventId}
[PropertyCreatedHandler] Triggered initial valuation request
```

### Idempotency in Action

```
[DealCreatedHandler] DealCreated event already processed: {eventId}
[DealCreatedHandler] Skipping duplicate event processing
```

### Financial Change Detection

```
[DealUpdatedHandler] Handling DealUpdated event for deal {id}
[DealUpdatedHandler] Financial changes detected: purchasePrice, interestRate
[DealUpdatedHandler] Triggered valuation recalculation
```

### No Financial Changes

```
[DealUpdatedHandler] Handling DealUpdated event for deal {id}
[DealUpdatedHandler] Deal updated but no financial changes detected, skipping recalculation
```

### Saga Workflow Steps

```
[ValuationSaga] Starting valuation workflow for property {id}
[ValuationSaga] Step 1: Fetching property data
[ValuationSaga] Step 2: Fetching deals for property
[ValuationSaga] Step 3: Calculating valuations for {n} deal(s)
[ValuationSaga] Step 4: Emitting completion events
[ValuationSaga] Valuation workflow completed
```

## Testing Event Store

The `EventStoreService` tracks processed events. To verify:

1. **Check processed count**: Look for log entries showing event processing
2. **Verify deduplication**: Retry same operation and check for idempotency warnings
3. **Event history**: Events are stored in memory (for now)

## Common Issues

### Events Not Firing

**Check:**
- Is `EventEmitterModule` imported in `AppModule`?
- Are handlers registered in `HandlersModule`?
- Is `HandlersModule` imported in `AppModule`?

### Correlation IDs Missing

**Check:**
- Is `CorrelationIdMiddleware` applied globally?
- Is `RequestContextService` injected in services?
- Are correlation IDs passed to event constructors?

### Idempotency Not Working

**Check:**
- Is `EventStoreModule` imported in `AppModule`?
- Are handlers checking `eventStore.hasBeenProcessed()`?
- Are events being marked as processed after handling?

## Performance Testing

To test async processing:

1. Create multiple properties/deals rapidly
2. Verify events are processed asynchronously
3. Check that correlation IDs are maintained
4. Verify no duplicate processing occurs

## Next Steps

After testing:
1. Review logs for any errors or warnings
2. Verify all event flows complete successfully
3. Check that valuations are recalculated correctly
4. Confirm idempotency prevents duplicate work
5. Verify correlation IDs track requests end-to-end

