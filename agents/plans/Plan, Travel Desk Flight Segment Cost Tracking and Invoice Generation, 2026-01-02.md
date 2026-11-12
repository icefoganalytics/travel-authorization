# Travel Desk Invoice Source and Editing Boundaries

Related issue: https://github.com/icefoganalytics/travel-authorization/issues/314

## Source selection

Staff link one TravelPort record locator to the Travel Desk request in Trip Information, before generating invoices. The picker offers real feed locators through bounded server-side filtering and pagination; passenger names do not establish a link. Invoicing uses that request-owned locator rather than accepting a separate search. Existing requests start unlinked. Staff can replace or clear the link without modifying saved invoice snapshots; no current requirement establishes multiple locators per request.

A booking history is not a single current invoice. Travel Desk staff choose one flight-bearing TravelPort event and any service-fee events separately. Booking versions, arrival order, and quoted fares do not determine the intended invoice automatically. Unversioned fee events and passive `GK` segments remain available for selection.

Every flight and selected fee must appear exactly once. Multiple versions of the same nonblank fee document cannot be combined, and fees in different currencies cannot be silently summed.

## Ownership and editing

The [TravelPort integration](/api/src/integrations/travel-port-integration/README.md) is a read-only external source. Authorized refreshes of the request's linked booking synchronize its events into application-owned booking records, keyed by the external TravelPort identifier. Repeated refreshes reconcile those records without duplicating events; a failed source lookup remains an error rather than silently returning cached history.

Invoice creation requires the requested locator to match the request's current link and the selected events to have been synchronized for that locator. It copies them into an invoice-owned snapshot without another external lookup. Later synchronization or request-link changes never update saved invoice snapshots or staff-entered prices. Editing uses the invoice snapshot, so an unavailable source cannot prevent saved-invoice editing or change its provenance.

A travel request may have multiple invoices. Request ownership, record locator, and source identities remain fixed after creation; staff can edit invoice details, prices, and additional charges. An optional local flight link must refer to a live segment belonging to the same request.

Amounts retain three decimal places. Sales retain their sign, refunds subtract their absolute value, and void lines contribute zero. Totals use integer thousandths to avoid floating-point rounding.

`TravelDeskInvoices.CalculateTotalService` owns these sale, refund, and void rules. Decimal-to-thousandths conversions live in separate `utils` modules; `InvoiceValidationError` has its own service-error module.

Deleting an invoice also soft-deletes its lines while retaining the source snapshot. Administrators manage product categories; built-in categories and categories referenced by invoice history cannot be deleted.

The existing request invoice number identifies a legacy TravCom invoice, not a TravelPort booking. The TravelPort link is stored separately. Passenger name record (PNR) attachments and the legacy itinerary remain unchanged; itinerary cutover remains outside this invoice-selection slice. Related source/linkage context is in [#293](https://github.com/icefoganalytics/travel-authorization/issues/293); reporting belongs to [#422](https://github.com/icefoganalytics/travel-authorization/issues/422).

## Environment boundary

Local development and tests use the synthetic source documented by the [development wrapper](/bin/README.md#testing). Only the deployed application connects to the production feed through a read-only account. Local evidence does not establish production connectivity or authoritative current-booking selection rules.

## Original design references

- [Travel Desk Invoice Entity Relationship Diagram.wsd](<Travel Desk Invoice Entity Relationship Diagram.wsd>)
- [Travel Desk Invoice Entity Relationship Diagram.png](<Travel Desk Invoice Entity Relationship Diagram.png>)
- [Travel Desk Invoice Source Schema Reference.sql](<Travel Desk Invoice Source Schema Reference.sql>)

These are investigative artifacts, not the application schema. The [application migration](/api/src/db/migrations/20261029000000_create-travel-desk-invoices.ts) owns the persisted schema; do not execute the reference SQL against an application or production database.
