# Implementation Plan: Stop-Based Travel Segment Model Refactoring

## Overview

Refactor the travel data model to introduce `TravelStop` as the primary entity representing waypoints, with `TravelSegment` connecting stops via foreign keys. This eliminates the current complexity where segments duplicate location data.

**Current Model:**
```
TravelSegment { departureLocationId, arrivalLocationId, ... }
```

**Target Model:**
```
TravelStop { sequenceNumber, locationId, arrivalDate/Time, departureDate/Time, ... }
TravelSegment { fromStopId, toStopId, modeOfTransport, ... }
TravelAuthorization {
  originLocationIdEstimate, finalDestinationLocationIdEstimate,
  originLocationIdActual, finalDestinationLocationIdActual, ...
}
```

**User Decisions:**
- Create NEW `TravelStop` model (don't modify old deprecated `Stop`)
- Use FK references: `fromStopId` → `toStopId`
- Auto-migrate existing segment data to generate stops
- Keep `tripType` fields (don't remove yet)
- **Add origin/destination location IDs directly to TravelAuthorization (denormalized for performance)**

---

## Phase 1: Database Layer (Days 1-3)

### Migration 1: Create travel_stops Table
**File:** `api/src/db/migrations/[TIMESTAMP]_create-travel-stops-table.ts`

**Schema:**
```sql
CREATE TABLE travel_stops (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  travel_authorization_id INTEGER NOT NULL REFERENCES travel_authorizations(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  arrival_date DATE NULL,
  arrival_time TIME NULL,
  departure_date DATE NULL,
  departure_time TIME NULL,
  is_actual BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW,
  UNIQUE (travel_authorization_id, sequence_number, is_actual)
)
```

**Key Features:**
- `sequence_number`: Orders stops (1, 2, 3...)
- Both arrival and departure times (nullable for first/last stop)
- `is_actual`: Separates estimates from actuals
- Composite unique constraint prevents duplicate sequences

### Migration 2: Add Stop FKs to travel_segments
**File:** `api/src/db/migrations/[TIMESTAMP]_add-stop-foreign-keys-to-travel-segments.ts`

Add columns:
- `from_stop_id INTEGER NULL REFERENCES travel_stops(id) ON DELETE RESTRICT`
- `to_stop_id INTEGER NULL REFERENCES travel_stops(id) ON DELETE RESTRICT`

Keep `departureLocationId` and `arrivalLocationId` as deprecated/nullable for backward compatibility.

### Migration 3: Add Origin/Destination to travel_authorizations
**File:** `api/src/db/migrations/[TIMESTAMP]_add-origin-destination-to-travel-authorizations.ts`

Add columns to denormalize origin/final destination for query performance:
```sql
ALTER TABLE travel_authorizations ADD COLUMN origin_location_id_estimate INTEGER NULL
  REFERENCES locations(id) ON DELETE RESTRICT;
ALTER TABLE travel_authorizations ADD COLUMN final_destination_location_id_estimate INTEGER NULL
  REFERENCES locations(id) ON DELETE RESTRICT;
ALTER TABLE travel_authorizations ADD COLUMN origin_location_id_actual INTEGER NULL
  REFERENCES locations(id) ON DELETE RESTRICT;
ALTER TABLE travel_authorizations ADD COLUMN final_destination_location_id_actual INTEGER NULL
  REFERENCES locations(id) ON DELETE RESTRICT;

-- Add indexes for common queries
CREATE INDEX idx_travel_authorizations_final_dest_estimate
  ON travel_authorizations(final_destination_location_id_estimate);
CREATE INDEX idx_travel_authorizations_final_dest_actual
  ON travel_authorizations(final_destination_location_id_actual);
```

**Benefits:**
- Fast queries for "all trips to Vancouver"
- No joins needed for summary views
- Direct access in `useTravelAuthorizationSummary`
- Matches the `PurposeEditFormCard` pattern we already established

### Migration 4: Data Migration (CRITICAL)
**File:** `api/src/db/migrations/[TIMESTAMP]_migrate-travel-segments-to-stops.ts`

**Algorithm:**
```
For each TravelAuthorization:
  For each isActual value (true/false):
    segments = segments.orderBy(segmentNumber)
    stops = []

    For segment in segments:
      # First stop: departure location
      if first segment:
        stops.push({
          sequenceNumber: 1,
          locationId: segment.departureLocationId,
          departureDate: segment.departureOn,
          departureTime: segment.departureTime
        })

      # Each segment's arrival location becomes a stop
      stops.push({
        sequenceNumber: stops.length + 1,
        locationId: segment.arrivalLocationId,
        arrivalDate: segment.departureOn (approximation),
        departureDate: nextSegment?.departureOn
      })

    # Create stops in DB
    createdStops = bulkInsert(stops)

    # Link segments to stops
    for i, segment in segments:
      segment.update({
        fromStopId: createdStops[i].id,
        toStopId: createdStops[i+1].id
      })

    # Update TravelAuthorization with origin/destination
    originLocationId = createdStops.first().locationId
    finalDestinationLocationId = createdStops.last().locationId

    if isActual:
      travelAuthorization.update({
        originLocationIdActual: originLocationId,
        finalDestinationLocationIdActual: finalDestinationLocationId
      })
    else:
      travelAuthorization.update({
        originLocationIdEstimate: originLocationId,
        finalDestinationLocationIdEstimate: finalDestinationLocationId
      })
```

**Testing:** Must test on copy of production data before running in production.

---

## Phase 2: Model Layer (Days 4-6)

### 2.1 Create TravelStop Model
**File:** `api/src/models/travel-stop.ts`

**Key Fields:**
```typescript
class TravelStop {
  id: number
  travelAuthorizationId: number
  sequenceNumber: number
  locationId: number
  arrivalDate?: Date
  arrivalTime?: string
  departureDate?: Date
  departureTime?: string
  isActual: boolean

  // Associations
  travelAuthorization: TravelAuthorization
  location: Location
  departingSegments: TravelSegment[]  // Segments leaving from this stop
  arrivingSegments: TravelSegment[]   // Segments arriving at this stop

  // Helper methods
  get arrivalAt(): Date | null
  get departureAt(): Date | null
}
```

**Validator:** Must have at least one of arrivalDate or departureDate set.

### 2.2 Update TravelSegment Model
**File:** `api/src/models/travel-segment.ts`

**Add:**
```typescript
fromStopId: number | null
toStopId: number | null

// Associations
fromStop?: TravelStop
toStop?: TravelStop
```

**Deprecate:**
```typescript
/** @deprecated Use fromStopId and fromStop instead */
departureLocationId: number | null

/** @deprecated Use toStopId and toStop instead */
arrivalLocationId: number | null
```

**Update Validator:** Check both old and new fields for location consistency.

### 2.3 Update TravelAuthorization Model
**File:** `api/src/models/travel-authorization.ts`

**Add fields (denormalized for performance):**
```typescript
originLocationIdEstimate: number | null
finalDestinationLocationIdEstimate: number | null
originLocationIdActual: number | null
finalDestinationLocationIdActual: number | null
```

**Add associations:**
```typescript
travelStops: TravelStop[]
travelStopEstimates: TravelStop[]  // where isActual = false
travelStopActuals: TravelStop[]    // where isActual = true

// Denormalized location associations
originLocationEstimate?: Location
finalDestinationLocationEstimate?: Location
originLocationActual?: Location
finalDestinationLocationActual?: Location
```

**Add computed properties:**
```typescript
get originLocation(): Location | null {
  return this.originLocationActual || this.originLocationEstimate
}

get finalDestinationLocation(): Location | null {
  return this.finalDestinationLocationActual || this.finalDestinationLocationEstimate
}
```

### 2.4 Register Model
**File:** `api/src/models/index.ts`

- Import and add `TravelStop` to `db.addModels()`
- Initialize scopes: `TravelStop.establishScopes()`
- Export `TravelStop`

---

## Phase 3: Service Layer (Days 7-10)

### 3.1 TravelStop Services
**Directory:** `api/src/services/travel-stops/`

**Create:**
- `create-service.ts` - Create single stop
- `update-service.ts` - Update stop
- `destroy-service.ts` - Delete stop
- `generate-stops-from-segments-service.ts` - Convert segment array to stop array (business logic)
- `bulk-create-with-segments-service.ts` - Atomic creation of stops + segments together

**Key Service: GenerateStopsFromSegmentsService**
```typescript
class GenerateStopsFromSegmentsService {
  perform(segments: TravelSegment[]): TravelStopAttributes[] {
    // Logic to deduplicate locations
    // Infer arrival/departure times
    // Assign sequence numbers
    // Return stop attributes ready for creation
  }
}
```

### 3.2 Update TravelSegment Services
**Files:**
- `api/src/services/travel-segments/create-service.ts` - Accept either stops OR locations
- `api/src/services/travel-segments/bulk-replace-service.ts` - Work with stop-based segments

### 3.3 Update Expense Services
**File:** `api/src/services/expenses/build-attributes-from-travel-segments-service.ts`

**Changes:**
- When loading segments, include both `departureLocation` and `fromStop.location`
- Add helper methods to get location from either source:
  ```typescript
  getSegmentDepartureLocation(segment) {
    return segment.fromStop?.location || segment.departureLocation
  }
  ```
- Use helpers throughout to maintain backward compatibility

---

## Phase 4: API Layer (Days 11-13)

### 4.1 Create TravelStops Controller
**File:** `api/src/controllers/travel-stops-controller.ts`

Endpoints:
- `GET /api/travel-stops` - List stops (ordered by sequence)
- `GET /api/travel-stops/:id` - Get single stop
- `POST /api/travel-stops` - Create stop
- `PATCH /api/travel-stops/:id` - Update stop
- `DELETE /api/travel-stops/:id` - Delete stop

### 4.2 Create Routes
**File:** `api/src/routes/travel-stops-router.ts`

Mount at `/api/travel-stops` in main router.

### 4.3 Create Policy & Serializers
**Files:**
- `api/src/policies/travel-stops-policy.ts` - Authorization rules
- `api/src/serializers/travel-stops/index-serializer.ts`
- `api/src/serializers/travel-stops/show-serializer.ts`
- `api/src/serializers/travel-stops/reference-serializer.ts`

---

## Phase 5: Frontend (Days 14-17)

### 5.1 Create TravelStops API Client
**File:** `web/src/api/travel-stops-api.ts`

```typescript
export type TravelStop = {
  id: number
  travelAuthorizationId: number
  sequenceNumber: number
  locationId: number
  arrivalDate?: string | null
  arrivalTime?: string | null
  departureDate?: string | null
  departureTime?: string | null
  isActual: boolean
  location?: { id: number; city: string; province: string }
}

export const travelStopsApi = {
  list(params): Promise<{ travelStops: TravelStop[] }>
  get(id): Promise<{ travelStop: TravelStop }>
  create(attrs): Promise<{ travelStop: TravelStop }>
  update(id, attrs): Promise<{ travelStop: TravelStop }>
  destroy(id): Promise<void>
}
```

### 5.2 Update Travel Segment Components
**Files to update:**
- `web/src/components/travel-segments/TravelSegmentsAttributesOneWayTripSection.vue`
- `web/src/components/travel-segments/TravelSegmentsAttributesRoundTripSection.vue`
- `web/src/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue`

**Strategy:** Add logic to generate stop attributes alongside segment attributes when saving.

### 5.3 Create Stop Display Component
**File:** `web/src/components/travel-stops/TravelStopsItinerary.vue`

Visual timeline component showing journey as stops with arrival/departure times.

### 5.4 Update Summary Components
Update `useTravelAuthorizationSummary` to use the denormalized fields:

**File:** `web/src/use/travel-authorizations/use-travel-authorization-summary.ts`

**Before:**
```typescript
// Complex logic to derive from segments
state.finalDestinationLocationId = _determineFinalDestinationLocationId(
  tripType,
  travelSegments
)
```

**After:**
```typescript
// Simply read from model
state.finalDestinationLocationId =
  travelAuthorization.finalDestinationLocationIdActual ||
  travelAuthorization.finalDestinationLocationIdEstimate
```

Much simpler!

---

## Phase 6: Testing (Days 18-20)

### 6.1 Migration Tests
**File:** `api/tests/db/migrations/travel-stops-migration.test.ts`

Test:
- One-way trip conversion
- Round-trip conversion
- Multi-city conversion
- Estimate vs actual separation
- Edge cases (missing dates, null locations)

### 6.2 Model Tests
**File:** `api/tests/models/travel-stop.test.ts`

Test:
- Model creation
- Validators
- Associations
- Magic methods (arrivalAt, departureAt)

### 6.3 Service Tests
Test GenerateStopsFromSegmentsService with various trip configurations.

### 6.4 Integration Tests
End-to-end workflow:
1. Create travel authorization
2. Add stops + segments
3. Calculate expenses
4. Verify data integrity

### 6.5 Frontend Tests
Component and integration tests for new stop components.

---

## Phase 7: Deployment (Days 21-23)

### 7.1 Pre-Deployment
1. Review all code changes
2. Run full test suite
3. Create database backup
4. Test migration on copy of production data

### 7.2 Staging Deployment
1. Deploy to staging
2. Run migrations
3. Verify data integrity
4. Test all workflows
5. Performance testing

### 7.3 Production Deployment
1. Schedule during low-traffic window
2. Create backup
3. Run migrations
4. Verify success
5. Monitor for issues

### 7.4 Rollback Plan
If issues occur:
- Revert migrations (drop travel_stops table, remove FK columns)
- Redeploy previous version
- Old location fields still populated as fallback

---

## Critical Files

**Backend Database:**
- `api/src/db/migrations/[TIMESTAMP]_create-travel-stops-table.ts`
- `api/src/db/migrations/[TIMESTAMP]_add-stop-foreign-keys-to-travel-segments.ts`
- `api/src/db/migrations/[TIMESTAMP]_add-origin-destination-to-travel-authorizations.ts`
- `api/src/db/migrations/[TIMESTAMP]_migrate-travel-segments-to-stops.ts` ⚠️ CRITICAL

**Backend Models:**
- `api/src/models/travel-stop.ts` (NEW)
- `api/src/models/travel-segment.ts` (UPDATE)
- `api/src/models/travel-authorization.ts` (UPDATE)

**Backend Services:**
- `api/src/services/travel-stops/generate-stops-from-segments-service.ts` (KEY LOGIC)
- `api/src/services/travel-stops/bulk-create-with-segments-service.ts`
- `api/src/services/expenses/build-attributes-from-travel-segments-service.ts` (UPDATE)

**Backend API:**
- `api/src/controllers/travel-stops-controller.ts` (NEW)
- `api/src/routes/travel-stops-router.ts` (NEW)
- `api/src/policies/travel-stops-policy.ts` (NEW)
- `api/src/serializers/travel-stops/` (NEW)

**Frontend:**
- `web/src/api/travel-stops-api.ts` (NEW)
- `web/src/components/travel-stops/TravelStopsItinerary.vue` (NEW)
- `web/src/components/travel-segments/*` (UPDATE)
- `web/src/use/travel-authorizations/use-travel-authorization-summary.ts` (UPDATE)

---

## Success Criteria

✅ All existing travel authorizations have corresponding travel stops
✅ All travel segments reference stops via fromStopId/toStopId
✅ Expense calculations work correctly with stop-based segments
✅ No data loss or corruption
✅ API backward compatible (old location fields still work)
✅ Frontend displays trips correctly
✅ All tests pass
✅ Query performance acceptable (<200ms)

---

## Benefits After Implementation

1. **Simpler Data Model:** Stops are first-class entities, not derived
2. **Better UX:** Display itinerary as chronological stops, not segments
3. **Easier Extensions:** Can add stop-level features (notes, accommodations, etc.)
4. **Clearer Business Logic:** "Travel from Stop A to Stop B via Segment X"
5. **Eliminates Complexity:** No more inferring final destination from segments
6. **Type Inference:** Round-trip = first stop == last stop location
7. **Fast Queries:** `WHERE final_destination_location_id = X` instead of joins through stops
8. **Frontend Simplicity:** Summary displays get origin/destination directly from TA

---

## Future Enhancements (Post-Launch)

1. Remove deprecated `departureLocationId`/`arrivalLocationId` fields (6+ months)
2. Add stop-level notes and special instructions
3. Add stop-level expenses (taxi, parking, etc.)
4. Create stop templates for common routes
5. Consider removing `tripType` entirely and inferring from stops
