# Project Knowledge Base

Durable project knowledge for Travel Authorization. For application setup and development commands, start with the [repository README](/README.md).

## Architecture

- [Travel Desk Report Downloads](/docs/architecture/report-downloads.md) - request selection, authorization, PDF and CSV generation, and runtime packaging.

## Primary Destination

A primary destination identifies the purpose of travel, not necessarily the final non-home city in the route. The traveller designates the arrival of a travel segment using `isPrimaryDestination`. Estimated and actual itineraries have independent selections; a segment marker is authoritative input, not a denormalized snapshot.

Multi-city travel requires an explicit selection before submitting the authorization or expense claim. A suggested destination is not confirmation, and drafts may remain unselected. Existing multi-city records are not automatically marked. Round-trip and one-way itineraries use their ordinary outbound and final arrivals as defaults.

Changing the designation does not change the route. Unrelated edits preserve the marker; removing the marked leg or changing its arrival requires a new selection. The existing travel-segment model owns this choice without reintroducing the legacy Stop model.

Primary-destination displays do not determine reimbursement rates. Meal and incidental calculations retain their separate itinerary-derived location rule. Persisted copies or derived values use `_snapshot`/`Snapshot` naming to distinguish them from authoritative inputs.
