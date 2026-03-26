# Plan, Travel Desk Flight Segment Cost Tracking and Invoice Generation, 2026-01-02

Related GitHub issue:
- https://github.com/icefoganalytics/travel-authorization/issues/314

## Purpose

This document captures a future implementation direction for Issue 314:
adding Travel Desk flight segment cost tracking and invoice generation.

This is a planning artifact only. It is not a statement that the feature is
implemented on this branch.

## Planning Artifacts In This Folder

- [Travel Desk Invoice Entity Relationship Diagram.wsd](/home/marlen/code/icefoganalytics/travel-authorization/agents/plans/Travel%20Desk%20Invoice%20Entity%20Relationship%20Diagram.wsd)
  PlantUML source for the proposed invoice data model.
- [Travel Desk Invoice Entity Relationship Diagram.png](/home/marlen/code/icefoganalytics/travel-authorization/agents/plans/Travel%20Desk%20Invoice%20Entity%20Relationship%20Diagram.png)
  Rendered version of the ERD for quick review.
- [Travel Desk Invoice Source Schema Reference.sql](/home/marlen/code/icefoganalytics/travel-authorization/agents/plans/Travel%20Desk%20Invoice%20Source%20Schema%20Reference.sql)
  External/source schema reference gathered during investigation.

## Current State

### Already Completed

- PNR documents have already been migrated away from
  `travel_desk_passenger_name_record_documents`.
- `travel_desk_travel_requests.invoice_number` already exists.
- PNR documents are now represented through `attachments` with
  `target_type = "TravelDeskTravelRequest"`.
- `TravelDeskTravelRequest.passengerNameRecordDocument` already exists as an
  attachment association.

Relevant migration:
- `20260105143528_migrate-pnr-documents-to-attachments-and-add-invoice-number-to-travel-requests.ts`

### Not Yet Implemented

- No invoice tables currently exist in the application schema.
- No invoice CRUD APIs currently exist in the API.
- No invoice/product type admin UI currently exists.
- No flight-segment-to-invoice-item linkage currently exists.

## Problem Statement

Travel Desk staff need a way to:

- track invoiceable costs at the flight-segment and line-item level
- associate invoice information with a Travel Desk travel request
- support invoice generation and review within the Travel Desk workflow

The current application has part of the required booking context, but it does
not yet have the persistence model or UI needed to capture invoice headers,
invoice line items, or product types.

## Proposed Data Model

### Existing Core Entity

`travel_desk_travel_requests` remains the core parent record for this feature.

Relevant existing column:
- `invoice_number` - nullable string added during the PNR migration work

### New Tables

#### 1. `travel_desk_product_types`

Lookup table for invoice item categories.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial4 | PK |
| `name` | varchar(255) | NOT NULL, UNIQUE |
| `description` | text | nullable |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |
| `deleted_at` | timestamptz | nullable |

#### 2. `travel_desk_invoices`

Invoice header linked to a travel request.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial4 | PK |
| `travel_desk_travel_request_id` | int4 | FK, NOT NULL |
| `invoice_number` | varchar(255) | nullable |
| `booking_date` | date | nullable |
| `invoice_date` | date | nullable |
| `record_locator` | varchar(255) | nullable |
| `client_number` | varchar(255) | nullable |
| `client_name` | varchar(255) | nullable |
| `department` | varchar(255) | nullable |
| `iata_number` | varchar(255) | nullable |
| `booking_agent_name` | varchar(255) | nullable |
| `ticketing_agent_name` | varchar(255) | nullable |
| `fares_amount` | decimal(10,2) | nullable |
| `taxes_amount` | decimal(10,2) | nullable |
| `penalties_amount` | decimal(10,2) | nullable |
| `gross_amount` | decimal(10,2) | nullable |
| `commissions_amount` | decimal(10,2) | nullable |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |
| `deleted_at` | timestamptz | nullable |

#### 3. `travel_desk_invoice_items`

Individual line items on an invoice.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial4 | PK |
| `travel_desk_invoice_id` | int4 | FK, NOT NULL |
| `travel_desk_product_type_id` | int4 | FK, NOT NULL |
| `travel_desk_flight_segment_id` | int4 | FK, nullable |
| `passenger_name` | varchar(255) | nullable |
| `ticket_number` | varchar(255) | nullable |
| `description` | varchar(255) | nullable |
| `gross_amount` | decimal(10,2) | NOT NULL |
| `sale_type` | varchar(255) | NOT NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |
| `deleted_at` | timestamptz | nullable |

## Proposed Application Work

### Backend

- Create `TravelDeskProductType`
- Create `TravelDeskInvoice`
- Create `TravelDeskInvoiceItem`
- Add model associations from travel request to invoices
- Add model associations from flight segment to invoice items
- Add CRUD controllers and serializers for invoices and product types
- Add policies for new invoice resources
- Add create/update services for invoice persistence

### Frontend

- Add `travel-desk-product-types-api.ts`
- Add `travel-desk-invoices-api.ts`
- Add composables for product types and invoices
- Add administration UI for product type management
- Add Travel Desk invoice UI for creating and editing invoices
- Add invoice item UI capable of linking items to flight segments

## Suggested Delivery Order

1. Create the three new tables and seed baseline product types.
2. Add API models, serializers, policies, and CRUD endpoints.
3. Add admin management for product types.
4. Add Travel Desk invoice header UI.
5. Add invoice item entry and flight segment linkage.
6. Add totals, review flow, and finishing touches.

## Open Questions

- Should `invoice_number` remain duplicated on
  `travel_desk_travel_requests` once `travel_desk_invoices` exists?
- Should a travel request support multiple invoices immediately, or should the
  UI initially assume one active invoice?
- Which invoice fields are authoritative from the external source system versus
  manually editable in TravelAuth?

## Notes

- The ERD and schema reference are investigative documents to support future
  implementation.
- The SQL reference file is not an application migration and should not be used
  as-is for app schema changes.
