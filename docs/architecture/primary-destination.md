# Primary Destination Architecture

The [feature specification](/docs/product/primary-destination.md) owns user-visible requirements. This document explains how the authorization owns the selected city without making itinerary identity or reimbursement calculations depend on that selection.

## Data Ownership

The [travel authorization model](/api/src/models/travel-authorization.ts) owns two nullable location references: `estimatedPrimaryDestinationId` and `actualPrimaryDestinationId`. Their database columns are `estimated_primary_destination_id` and `actual_primary_destination_id` on `travel_authorizations`, each referencing `locations.id`. Foreign keys restrict deletion of referenced locations.

The references represent independent city choices, not particular arrival legs or denormalized snapshots. A selected city can therefore survive replacement or reordering of itinerary rows and repeated visits. Persisted copies or derived values use `_snapshot`/`Snapshot` naming to distinguish them from authoritative inputs.

## Mutation and Validation Boundaries

Itinerary mutations hold the authorization lock while [reconciling the destination](/api/src/services/travel-authorizations/reconcile-primary-destination-service.ts) in the same transaction. Reconciliation retains a multi-city selection while a matching arrival remains; otherwise it clears that phase's selection. Round-trip and one-way reconciliation derives their ordinary destination from the route.

The [authorization update service](/api/src/services/travel-authorizations/update-service.ts) applies nested itinerary changes before validating an explicit city. The [destination validator](/api/src/services/travel-authorizations/validate-primary-destination-service.ts) derives the active phase and required-selection boundary from authorization status and wizard step, rather than caller-selected validation modes. The [wizard update service](/api/src/services/travel-authorizations/wizard/update-service.ts) validates a proposed step before saving it, so advancing the workflow cannot bypass the selection requirement.

Returned-claim correction uses the authorization PATCH endpoint. The authorization policy and update service restrict this correction to the owner or an administrator and permit only `actualPrimaryDestinationId`; it is not a general route or expense edit.

## Read and Calculation Boundaries

The [index serializer](/api/src/serializers/travel-authorizations/index-serializer.ts) and [show serializer](/api/src/serializers/travel-authorizations/show-serializer.ts) read the phase's preloaded destination association directly. They do not infer the primary city from the route, and an unset actual destination does not fall back to the estimate.

Primary-destination displays do not determine reimbursement rates. Meal and incidental calculations retain their separate [itinerary-derived location rule](/api/src/services/expenses/build-attributes-from-travel-segments-helpers/determine-final-destination.ts). Changing the displayed primary city must not change that calculation boundary.

## Legacy Data Compatibility

The [location-reference migration](/api/src/db/migrations/20261112120000_add-primary-destinations-to-travel-authorizations.ts) backfills estimated and actual destinations independently to preserve existing records when introducing explicit selections. It orders each phase's legs by segment number and ID, then uses:

- Round trip: the first arrival.
- One way: the final arrival.
- Multi-city: the final arrival, unless it returns to the origin, in which case the preceding arrival is used.

For legacy actual travel with no actual trip type, the migration uses the estimated trip type. Missing destinations remain null. This is one-time compatibility inference, not ongoing multi-city selection or evidence of traveller confirmation. Future multi-city selections follow the feature specification.

## Contract Coverage

[Authorization update tests](/api/tests/services/travel-authorizations/update-service.test.ts) cover phase-specific choices and returned-claim restrictions. [Index serialization tests](/api/tests/serializers/travel-authorizations/index-serializer.test.ts) and [show serialization tests](/api/tests/serializers/travel-authorizations/show-serializer.test.ts) cover reading the saved associations, including an unset actual destination. [Expense-location tests](/api/tests/services/expenses/build-attributes-from-travel-segments-helpers/determine-final-destination.test.ts) cover the separate reimbursement location rule.
