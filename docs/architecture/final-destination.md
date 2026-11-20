# Final Destination Architecture

The [feature specification](/docs/product/final-destination.md) owns user-visible requirements. The authorization owns one selected city independently of itinerary rows and reimbursement calculations.

## Data and API Ownership

The [travel authorization model](/api/src/models/travel-authorization.ts) stores `finalDestinationLocationId` in `travel_authorizations.final_destination_location_id`, a nullable foreign key to `locations.id`. Nullable storage supports initial blank drafts and legacy requests without a known destination.

The existing `finalDestination` response contains the saved location reference. `finalDestinationLocationId` is the persisted input and UI projection. These names describe the traveller's selected destination, not the last chronological arrival or return-home city. Estimated and actual travel share this choice.

## Mutation Boundaries

Only the Purpose editor changes `finalDestinationLocationId`. The wizard summary reads the saved city and reflects edits made on Purpose. Estimated and actual trip forms send route attributes, not the destination. The approved-state policy excludes destination changes even when the user can edit actual travel.

Travel-segment creation, replacement, deletion, and reordering do not update the destination. The location is selected before the itinerary is completed, so selecting it does not require a matching saved arrival. Editing the destination must not rewrite an existing route.

Purpose uses the standard authorization save and does not submit nested itinerary changes. The traveller and manager creation forms seed the initial estimated legs; Trip Details edits them.

## Read and Calculation Boundaries

The [index serializer](/api/src/serializers/travel-authorizations/index-serializer.ts) and [show serializer](/api/src/serializers/travel-authorizations/show-serializer.ts) use the saved destination association rather than deriving it from route order. Summaries and actual travel use the same selected city.

Meal and incidental calculations retain their separate [itinerary-derived location rule](/api/src/services/expenses/build-attributes-from-travel-segments-helpers/determine-final-destination.ts). A destination change does not change that calculation boundary.

## Legacy Data Compatibility

The migration infers a destination once for existing requests from their recorded itinerary. Estimated travel supplies the early destination when available; an actual-only itinerary can supply a legacy fallback. The stored result is not evidence of traveller confirmation and is not recalculated on subsequent route edits.

Round trips use the first arrival, one-way trips use the final arrival, and multi-city trips use the final arrival unless it returns to the origin, in which case they use the preceding arrival. Unknown destinations remain null.

## Contract Coverage

Authorization update tests cover saving a city independently of route changes and retaining normal edit permissions. Index and show serializer tests cover returning the saved city. Purpose form tests cover the input and save payload; browser QA verifies the request journey. Expense-location tests continue to cover the separate reimbursement rule.
