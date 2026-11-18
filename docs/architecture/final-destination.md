# Final Destination Architecture

## Data Ownership

The authorization owns one saved destination, independent of itinerary rows. `finalDestinationLocationId` maps to `travel_authorizations.final_destination_location_id`, a nullable foreign key to `locations.id`. Nullable storage supports blank drafts and legacy requests without a known destination. Estimated and actual travel share this choice rather than storing separate phase selections.

## Legacy Data Compatibility

Existing requests receive a one-time destination backfill from their recorded itinerary. Estimated travel supplies the destination when available because it records the original travel intent; actual-only itineraries supply a fallback. Round trips use the first arrival, one-way trips use the final arrival, and multi-city trips use the final arrival unless it returns to the origin, in which case they use the preceding arrival. Unknown destinations remain null.

This inference preserves existing records; it is not evidence of traveller confirmation. The stored destination is not continually recalculated from itinerary order. Reimbursement calculations retain their separate itinerary-derived location rule.
