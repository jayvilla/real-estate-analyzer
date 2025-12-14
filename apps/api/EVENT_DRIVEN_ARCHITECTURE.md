# Event-Driven Architecture & Saga Pattern

This document describes the event-driven architecture implementation with saga/workflow orchestration and idempotent processing.

## Overview

The system uses an event-driven architecture where domain events trigger workflows and handlers. All events support idempotent processing to ensure safe retries and prevent duplicate processing.

## Domain Events

### Base Event
All events extend `BaseEvent` which provides:
- **Event ID**: Unique identifier for idempotency
- **Timestamp**: When the event occurred
- **Correlation ID**: Links events to the original request

### Event Types

1. **PropertyCreatedEvent**
   - Emitted when a property is created
   - Triggers: Initial valuation request

2. **DealCreatedEvent**
   - Emitted when a deal is created
   - Triggers: Valuation recalculation for the property

3. **DealUpdatedEvent**
   - Emitted when a deal is updated
   - Includes previous values for change detection
   - Triggers: Valuation recalculation (only if financial fields changed)

4. **ValuationRequestedEvent**
   - Emitted when a valuation is requested
   - Can be triggered manually or automatically

5. **ValuationRecalculationRequestedEvent**
   - Emitted when valuation needs to be recalculated
   - Triggered by deal changes

6. **ValuationCompletedEvent**
   - Emitted when valuation calculation completes
   - Contains the calculated valuation data

## Event Handlers

### PropertyCreatedHandler
- Listens to: `property.created`
- Actions:
  - Marks event as processed (idempotency)
  - Automatically triggers initial valuation request
  - Logs property creation workflow

### DealCreatedHandler
- Listens to: `deal.created`
- Actions:
  - Marks event as processed (idempotency)
  - Triggers valuation recalculation for the property
  - Logs deal creation workflow

### DealUpdatedHandler
- Listens to: `deal.updated`
- Actions:
  - Marks event as processed (idempotency)
  - Detects if financial fields changed
  - Triggers valuation recalculation only if financial changes detected
  - Logs deal update workflow

### ValuationRecalculationHandler
- Listens to: `valuation.recalculation.requested`
- Actions:
  - Marks event as processed (idempotency)
  - Performs async valuation recalculation
  - Recalculates specific deal or all deals for property
  - Emits `valuation.completed` event

## Saga/Workflow Orchestration

### ValuationSaga
Implements a multi-step workflow for property valuation:

**Workflow Steps:**
1. **Fetch Property Data**: Retrieves property information
2. **Fetch Associated Deals**: Gets all deals for the property
3. **Calculate Valuations**: Computes valuations for all deals
4. **Emit Completion Events**: Publishes completion events for each deal
5. **Workflow Complete**: Logs completion

**Features:**
- Idempotent processing
- Error handling with structured logging
- Correlation ID tracking
- Multi-deal support

## Idempotent Processing

### EventStoreService
Tracks processed events to prevent duplicate processing:

- **hasBeenProcessed(eventId)**: Checks if event was already processed
- **markAsProcessed(event)**: Marks event as processed
- **getEventHistory(eventId)**: Retrieves event history for auditing
- **clearProcessedEvents()**: Clears store (for testing)

### How It Works

1. Each event has a unique `eventId`
2. Before processing, handler checks if event was already processed
3. If processed, handler logs warning and returns early
4. If not processed, handler processes event and marks as processed
5. This ensures safe retries and prevents duplicate work

## Async Recalculation Triggers

### Automatic Triggers

**Deal Created:**
- When a new deal is created → Triggers valuation recalculation

**Deal Updated:**
- When deal financial fields change → Triggers valuation recalculation
- Financial fields include:
  - purchasePrice
  - loanAmount
  - interestRate
  - loanTerm
  - rental income
  - expenses
  - vacancy rate
  - property management rate

**Property Created:**
- When a new property is created → Triggers initial valuation request

### Manual Triggers

Valuation can be manually requested via:
- `ValuationRequestedEvent` emission
- API endpoint (if implemented)

## Event Flow Examples

### Example 1: Property Creation Flow

```
1. POST /api/properties
   ↓
2. PropertyService.create()
   ↓
3. Emit PropertyCreatedEvent
   ↓
4. PropertyCreatedHandler.handlePropertyCreated()
   ↓
5. Emit ValuationRequestedEvent
   ↓
6. ValuationSaga.handleValuationRequested()
   ↓
7. Calculate valuations
   ↓
8. Emit ValuationCompletedEvent
```

### Example 2: Deal Update Flow

```
1. PATCH /api/deals/:id
   ↓
2. DealService.update()
   ↓
3. Emit DealUpdatedEvent (with previous values)
   ↓
4. DealUpdatedHandler.handleDealUpdated()
   ↓
5. Check if financial fields changed
   ↓
6. If changed → Emit ValuationRecalculationRequestedEvent
   ↓
7. ValuationRecalculationHandler.handleValuationRecalculation()
   ↓
8. Recalculate valuation
   ↓
9. Emit ValuationCompletedEvent
```

## Correlation IDs

All events include correlation IDs that:
- Link events to the original HTTP request
- Enable tracing across the event chain
- Are included in all logs
- Allow tracking workflows end-to-end

## Error Handling

Event handlers are designed to be fault-tolerant:
- Errors are logged but don't crash the system
- Failed events can be retried (idempotency ensures safety)
- Structured logging includes full context
- Correlation IDs help trace errors across events

## Testing

To test the event-driven system:

1. **Create a property** - Should trigger valuation request
2. **Create a deal** - Should trigger valuation recalculation
3. **Update deal financials** - Should trigger valuation recalculation
4. **Check logs** - Should see event flow with correlation IDs
5. **Retry same operation** - Should see idempotency warnings

## Best Practices

1. **Always check idempotency** before processing events
2. **Include correlation IDs** in all events
3. **Log event processing** for debugging
4. **Handle errors gracefully** - don't crash on handler errors
5. **Use structured logging** for better observability
6. **Emit completion events** to signal workflow completion

## Future Enhancements

- Persistent event store (database instead of in-memory)
- Event replay capability
- Dead letter queue for failed events
- Event versioning for schema evolution
- Distributed event processing
- Event sourcing pattern

