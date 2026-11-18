# Final Destination

## Purpose and Scope

A traveller chooses the city that represents the purpose of travel in the existing **Final Destination** field on **Purpose**. That choice stays with the request through estimated and actual travel. For example, Whitehorse → Toronto → Vancouver → Whitehorse can have Toronto as its destination even though Vancouver is the last non-home stop.

This specification owns the destination behavior agreed in [issue #463](https://github.com/icefoganalytics/travel-authorization/issues/463). It does not redefine the itinerary, reimbursement rates, or Travel Desk hotel defaults. See the [architecture contract](/docs/architecture/final-destination.md) for persistence and integration boundaries.

## Choosing and Reusing a City

A new request can begin as a blank draft. The existing required destination field is completed with the other purpose details before continuing. The selection identifies a city, not a particular itinerary leg.

Trip details, summaries, request lists, and actual travel reuse the saved destination. **Trip Details** and **Confirm Actual Travel Details** prefill **Final Destination** with that choice and allow an intentional change. Keeping the saved choice requires no reselection or confirmation, and there is no destination checkbox beside itinerary legs.

Changing dates, trip type, route order, or itinerary rows does not replace or clear the saved destination. Returning home must not make the home city the request's destination. Editing the destination on an editable Purpose form does not rewrite an existing itinerary.

The existing workflow determines who may edit each step. An owner or administrator editing an approved request's actual travel may also update its destination. Returned expense claims retain their existing edit restrictions.

## Existing Requests

Existing requests receive a one-time destination backfill from their itinerary so they remain readable. This is compatibility inference, not evidence of a traveller's explicit choice. After migration, route edits do not continually recalculate that destination.

## Acceptance Scenarios

- Choose Toronto on **Purpose**, continue, and reload: the saved destination is Toronto.
- Build Whitehorse → Toronto → Vancouver → Whitehorse on **Trip Details**: the summary still shows Toronto.
- Change dates, reorder or replace legs, and save: the destination remains Toronto.
- Return to an editable Purpose form and change its text: the route and destination remain unchanged.
- Change the destination on Purpose: the new city is saved without rewriting the existing route.
- On **Trip Details**, deliberately choose a different **Final Destination**, save, and reload: the new city persists without changing the itinerary.
- On **Confirm Actual Travel Details**, retain the prefilled choice or deliberately change it: the summary and saved request reflect that choice.
- Check round-trip and one-way requests: the same saved-choice and optional-edit behavior applies.

Service and serializer tests cover persistence and response contracts; Purpose form tests and browser QA cover the early selection and later reuse. Run-specific evidence belongs in the pull request or session, not this specification.
