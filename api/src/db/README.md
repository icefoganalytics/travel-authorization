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

Database tables use `snake_case`, while application models use `camelCase`. When you add or update
columns, keep that mapping in mind.

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
  [`../../config.ts`](../../config.ts).
