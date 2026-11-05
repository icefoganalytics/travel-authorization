# Plan, Travel Desk Flight Segment Cost Tracking and Invoice Generation, 2026-01-02

Related GitHub issue: https://github.com/icefoganalytics/travel-authorization/issues/314

## Implementation

The issue branch implements booking-feed-driven invoices independently of the Travel Desk
modernization PRs. Travel Desk staff and administrators can open **Invoices** from a request,
or use its existing **Invoicing** step, and:

1. Search by a six-character Travelport record locator.
2. Explicitly choose a source event containing flights and select any service-fee events separately.
3. Generate one line per source flight and selected fee, enter flight prices, and add other charges.
4. Link a line to a live local flight segment belonging to the same request.
5. Save, reopen, edit, or delete invoices. A request can have multiple invoices.

The application does not infer a current booking from arrival order or the largest version.
It preserves unversioned fee events and passive `GK` segments. Selecting multiple versions of
the same nonblank fee document is rejected; fees with different currencies cannot be silently summed.
Quoted fares are not treated as final invoice amounts.

## Persistence and source ownership

The authoritative application schema is
[`20261029000000_create-travel-desk-invoices.ts`](../../api/src/db/migrations/20261029000000_create-travel-desk-invoices.ts):

- `travel_desk_product_types`: unique immutable codes and editable names/descriptions.
  Administrators manage products; Travel Desk staff can read them. Built-in **Air**,
  **Service Fee**, **Credit**, and **Change Fee** products cannot be deleted. Neither can products
  referenced by active or deleted invoices.
- `travel_desk_invoices`: request ownership, record locator, selected booking-event identifier,
  an immutable server-read source snapshot, editable header fields, currency, and calculated total.
- `travel_desk_invoice_items`: ordered prices/charges, sale/refund/void type, source flight or
  service-fee identity, and an optional request-local flight-segment link.

Amounts use decimal strings and `DECIMAL(18,3)`. Totals are calculated in integer thousandths:
sales retain their sign, refunds subtract their absolute value, and void lines contribute zero.
Every selected source flight and fee must remain represented exactly once.

Creation reads the [separate Travelport integration](../../api/src/integrations/travelport-integration/README.md).
Edits use the saved snapshot rather than re-reading or silently changing the source selection.
Deleting an invoice soft-deletes its lines and retains its original snapshot.
Request, locator, and source identifiers are not mutable through invoice updates.

The existing `TravelDeskTravelRequest.invoiceNumber` remains the legacy TravCom identifier.
It is not a Travelport locator and is not overwritten by this workflow. PNR attachments and
the legacy TravCom itinerary remain separate. Reporting (#422) and booking-save policy changes
(#420) are outside this implementation.

## Development and verification

Use the [development wrapper](../../bin/README.md). Its startup runs the application migration
and provides the synthetic SQL Server 2019 Travelport database; no VPN or production access is needed.
`ZZ0001` contains thirteen booking snapshots plus a separate fee event. Select an event explicitly;
do not assume the final displayed row is the current booking. The other synthetic locators cover
fare events, multiple passengers, missing flights, and six-flight bookings.

The focused invoice services and controller suites live under
`api/tests/services/travel-desk-invoices`, `api/tests/controllers/travel-desk-invoices`, and
`api/tests/controllers/travel-desk-invoices-controller.test.ts`. Product policy, controller,
and deletion tests cover the administration boundary. Follow `bin/README.md` for test commands
and isolated database selection.

Production requires the separately documented read-only Travelport connection and the normal
application migration. Synthetic local verification does not prove production connectivity.
Authenticated browser acceptance requires an authorized account; CAPTCHA must not be bypassed.

## Original design references

- [Travel Desk Invoice Entity Relationship Diagram.wsd](<Travel Desk Invoice Entity Relationship Diagram.wsd>)
- [Travel Desk Invoice Entity Relationship Diagram.png](<Travel Desk Invoice Entity Relationship Diagram.png>)
- [Travel Desk Invoice Source Schema Reference.sql](<Travel Desk Invoice Source Schema Reference.sql>)

These are investigative artifacts, not the implemented schema. Do not execute the reference SQL
as an application migration or against production.
