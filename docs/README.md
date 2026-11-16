# Project Knowledge Base

Durable project knowledge for Travel Authorization. For application setup and development commands, start with the [repository README](/README.md).

## Architecture

- [Travel Desk Report Downloads](/docs/architecture/report-downloads.md) - request selection, authorization, PDF and CSV generation, and runtime packaging.

## Primary Destination

A primary destination identifies the purpose of travel, not necessarily the final non-home city in the route. The authorization owns two nullable location references: `estimatedPrimaryDestinationId` and `actualPrimaryDestinationId`. They represent independent city selections, not particular arrival legs or denormalized snapshots.

Multi-city travel requires an explicit selection before submitting the authorization or expense claim. A suggested destination is not confirmation, and drafts may remain unselected. Existing multi-city records are not automatically assigned a destination. Round-trip and one-way itineraries use their ordinary outbound and final arrivals as defaults.

Travellers correcting a returned expense claim can confirm an existing actual arrival as its primary destination. This correction does not permit changes to the submitted route or expenses.

Changing the designation does not change the route. The selected location must appear among the corresponding itinerary's arrivals. Unrelated edits and removal of one repeated visit preserve the selection while another arrival still matches. Removing the last matching arrival clears it. Copying estimated legs into actual travel does not confirm an actual multi-city destination.

Primary-destination displays do not determine reimbursement rates. Meal and incidental calculations retain their separate itinerary-derived location rule. Persisted copies or derived values use `_snapshot`/`Snapshot` naming to distinguish them from authoritative inputs.
