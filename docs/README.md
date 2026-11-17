# Project Knowledge Base

Durable project knowledge for Travel Authorization. For application setup and development commands, start with the [repository README](/README.md).

## Architecture

- [Travel Desk Report Downloads](/docs/architecture/report-downloads.md) - request selection, authorization, PDF and CSV generation, and runtime packaging.

## Primary Destination

A primary destination identifies the purpose of travel, not necessarily the final non-home city in the route. The authorization owns two nullable location references: `estimatedPrimaryDestinationId` and `actualPrimaryDestinationId`, stored as `estimated_primary_destination_id` and `actual_primary_destination_id` foreign keys to `locations.id` on `travel_authorizations`. They represent independent city selections, not particular arrival legs or denormalized snapshots.

New multi-city travel requires an explicit selection before continuing past **Trip Details**, and actual travel requires its own selection before continuing past **Confirm Actual Travel Details**. The initial purpose-details draft can remain unselected. A suggested destination is not confirmation. Subsequent saves and submission validate the active phase using the authorization's workflow state, rather than caller-selected validation modes. The migration backfills existing estimated and actual destinations independently: the first arrival for round trips, the final arrival for one-way trips, and the final arrival for multi-city trips unless it returns to the origin, in which case the preceding arrival is used. Missing destinations remain null. This one-time inference preserves existing records; subsequent multi-city selections use the UI rather than automatic inference. Round-trip and one-way itineraries retain their ordinary outbound and final arrivals as defaults. Switching to multi-city clears an inferred choice unless the update supplies an explicit city.

The owner or an administrator correcting a returned expense claim can confirm an existing actual arrival as its primary destination through the authorization PATCH endpoint. Only `actualPrimaryDestinationId` may change; this correction does not permit changes to the estimated destination, submitted route, or expenses.

Changing the designation does not change the route. The selected location must appear among the corresponding itinerary's arrivals. Itinerary mutations lock the authorization while reconciling its selection. Unrelated edits and removal of one repeated visit preserve the selection while another arrival still matches. Removing the last matching arrival clears it. Copying estimated legs into actual travel does not confirm an actual multi-city destination.

Destination serializers read the phase's preloaded location association directly. Once actual travel is active, an unselected actual destination does not fall back to the estimate.

Primary-destination displays do not determine reimbursement rates. Meal and incidental calculations retain their separate itinerary-derived location rule. Persisted copies or derived values use `_snapshot`/`Snapshot` naming to distinguish them from authoritative inputs.
