# Primary Destination

## Purpose and Scope

A traveller identifies the city that represents the purpose of travel so that summaries and approvals do not mistake a connection or return home for the trip's destination. For example, Whitehorse → Toronto → Vancouver → Whitehorse can have Toronto as its primary destination even though Vancouver is the last non-home stop.

This specification owns the primary-destination behavior agreed in [issue #463](https://github.com/icefoganalytics/travel-authorization/issues/463). It does not redefine the itinerary, reimbursement rates, or Travel Desk hotel defaults. See the [architecture contract](/docs/architecture/primary-destination.md) for persistence and integration boundaries.

## Choosing a City

Estimated and actual travel have independent primary destinations. A choice identifies a city, not a particular leg: visiting the same city twice does not create two different destinations. The city must be an arrival in the corresponding itinerary.

For multi-city trips, the traveller explicitly selects a primary city. A suggestion is not confirmation; accepting it must be an intentional action. Copying estimated legs into actual travel does not confirm an actual multi-city destination.

Round-trip travel defaults to its outbound arrival, and one-way travel defaults to its final arrival. Switching to multi-city clears that inferred choice unless the traveller supplies an explicit city with the change.

## When a Choice Is Required

A new request can begin without a destination. The traveller must choose one before continuing past **Trip Details** for a multi-city estimate. Actual multi-city travel requires its own choice before continuing past **Confirm Actual Travel Details**. After those boundaries, saves and submission require a valid destination for the active phase.

Once actual travel is active, an unselected actual destination displays as unset; it must not fall back to the estimated city.

## Editing and Corrections

Changing the primary destination must not rewrite the route. Unrelated edits and removal of one repeated visit preserve the choice while another arrival still matches. Removing the last matching arrival invalidates the choice; where selection is required, the traveller must provide a replacement before continuing.

The owner or an administrator can correct the actual primary destination of an expense claim returned to its traveller. They may choose an existing actual arrival without reopening edits to the estimated destination, submitted route, or expenses through this correction.

Existing trips retain their previously inferred destinations through a one-time backfill. That compatibility behavior does not make automatic inference the selection rule for new multi-city trips. Missing destinations remain unset; the [legacy-data contract](/docs/architecture/primary-destination.md#legacy-data-compatibility) specifies the backfill.

## Acceptance Scenarios

- Choose Toronto on Whitehorse → Toronto → Vancouver → Whitehorse. Save and reload: the summary shows Toronto and the route is unchanged.
- Leave a new multi-city destination blank: the initial draft is allowed, but **Continue** from **Trip Details** requires a choice.
- Select a different actual city: it persists independently of the estimate. An unset actual city never displays the estimated city instead.
- Visit the selected city twice and remove one visit: the selection survives. Remove the last matching visit: a new valid choice is needed.
- Correct a returned claim as its owner or an administrator: the actual city changes without changing its itinerary or expenses.

[Service coverage](/api/tests/services/travel-authorizations/update-service.test.ts), [wizard transition coverage](/api/tests/services/travel-authorizations/wizard/update-service.test.ts), and [multi-city selector coverage](/web/tests/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.test.ts) exercise these boundaries. Run-specific results and review instructions belong in the pull request, not this specification.
