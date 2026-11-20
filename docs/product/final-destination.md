# Final Destination

## Purpose and Scope

A traveller chooses the city that represents the purpose of travel in the existing **Final Destination** field on **Purpose**. That choice stays with the request through estimated and actual travel. For example, Whitehorse → Toronto → Vancouver → Whitehorse can have Toronto as its destination even though Vancouver is the last non-home stop.

This specification owns the destination behavior agreed in [issue #463](https://github.com/icefoganalytics/travel-authorization/issues/463). It does not redefine the itinerary, reimbursement rates, or Travel Desk hotel defaults. See the [architecture contract](/docs/architecture/final-destination.md) for persistence and integration boundaries.

## Choosing and Reusing a City

A new request can begin as a blank draft. The existing required destination field is completed with the other purpose details before continuing. The selection identifies a city, not a particular itinerary leg.

Purpose is the only place to correct the destination. On **Trip Details** and **Confirm Actual Travel Details**, the wizard summary shows the selected city. Travellers enter where they plan to go or actually went without choosing the destination again.

Changing dates, trip type, route order, or itinerary rows does not replace or clear the saved destination. Returning home must not make the home city the request's destination. Editing the destination on an editable Purpose form does not rewrite an existing itinerary.

After approval, the destination stays as approved. If Toronto was approved but the traveller went to Vancouver instead, the request still shows Toronto as its destination and the actual itinerary records Vancouver.

## Existing Requests

Existing requests receive a one-time destination backfill from their itinerary so they remain readable. This is compatibility inference, not evidence of a traveller's explicit choice. After migration, route edits do not continually recalculate that destination.

## Acceptance Scenarios

- Choose Toronto on **Purpose**, continue, and reload: the saved destination is Toronto.
- Build Whitehorse → Toronto → Vancouver → Whitehorse on **Trip Details**: the summary still shows Toronto.
- Change dates, reorder or replace legs, and save: the destination remains Toronto.
- Return to an editable Purpose form and change its text: the route and destination remain unchanged.
- Change the destination on Purpose: the new city is saved without rewriting the existing route.
- Confirm an actual itinerary to Vancouver for a request approved for Toronto. After saving and reloading, the actual route shows Vancouver and the destination still says Toronto.
- The same rule applies to round-trip, one-way, and multi-city travel.

Service and serializer tests cover persistence and response contracts; Purpose form tests and browser QA cover the early selection and later reuse. Run-specific evidence belongs in the pull request or session, not this specification.
