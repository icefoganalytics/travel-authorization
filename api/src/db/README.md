# Database

This directory contains TravelAuth's database migrations, seeds, and related utilities.

If you are new to the project, read the root [README.md](../../../README.md) first, then
[api/README.md](../../README.md), then use this file for database-specific work.

## What Lives Here

- `migrations/` - schema changes
- `seeds/` - environment-specific seed data

## How Database Changes Are Used

In development, the database normally starts through the Docker Compose stack and is managed
through the `dev` wrapper.

Common commands:

```bash
dev psql
dev migrate up
dev migrate down
dev migrate make create-table-name
```

## Migrations

TravelAuth uses [Knex migrations](https://knexjs.org/guide/migrations.html#migration-cli).

Define migration entrypoints with named `up` and `down` function declarations:
`export function up(...)` and `export function down(...)`. Use `export async function`
when the migration awaits database operations, rather than assigning functions to `exports`
or exported constants.

Database tables use `snake_case`, while application models use `camelCase`. When you add or update
columns, keep that mapping in mind.

Prefer Knex schema-builder methods over raw DDL when they express the same constraint.
Use `table.unique(..., { predicate })` for partial unique indexes. Roll them back with
`table.dropIndex(...)`, not `table.dropUnique(...)`; PostgreSQL treats them as indexes
rather than unique constraints. With Knex 3.0.1, partial-index predicates must not contain
value placeholders; use a literal boolean in `knex.whereRaw(...)` instead of
`knex.where(column, true)`.

Primary destinations are nullable `locations.id` foreign keys on `travel_authorizations`:
`estimated_primary_destination_id` and `actual_primary_destination_id`. Each phase independently
selects a city, not a segment. Itinerary mutations lock the authorization and preserve the city while
any arrival in that phase still matches; removing the last matching arrival clears the selection.
Multi-city submission requires an explicitly confirmed matching arrival, including legacy records.
Simple trips retain their ordinary outbound/one-way defaults. Switching to multi-city clears inferred
choices unless the update supplies an explicit city. Returned claims allow only owner/administrator
correction of `actualPrimaryDestinationId` through the authorization PATCH; itinerary and expenses
remain unchanged.

### Create A Migration

Create a new migration with:

```bash
dev migrate make create-table-name
```

Alternative pattern:

```bash
cd api
npm run knex migrate:make create-table-name
```

### Run Migrations

```bash
dev migrate up
```

### Roll Back Migrations

```bash
dev migrate down
```

## Seeding

Migrations and seeds normally run during boot when you start the full stack.

To skip seeding when the database already contains data, set:

```bash
SKIP_SEEDING_UNLESS_EMPTY=true
```

## SQL Access

Open the SQL console with:

```bash
dev psql
```

## Beginner Notes

- `dev down -v` removes containers and drops the local database volume, so use it carefully.
- The main API environment variable list, including database settings, lives in
  [`../config.ts`](../config.ts).
