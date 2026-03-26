# Top-Level Bin Directory

## `dev` Command

The `dev` command is a small helper around Docker Compose plus a few TravelAuth-specific
development tasks.

## Set Up `dev`

`dev` requires Ruby.

Basic usage:

1. Run it as `./bin/dev ...` from the repo root.
2. If you want to use `dev ...` instead, add `bin/` to your `PATH`.

## Common Commands

### Docker Compose Operations

```bash
./bin/dev up
./bin/dev up api
./bin/dev up web
./bin/dev down
./bin/dev logs
./bin/dev ps
```

### Development Tools

```bash
./bin/dev sh
./bin/dev debug
./bin/dev api npm run lint
./bin/dev web npm run check-types
./bin/dev check-types
```

### Testing

```bash
./bin/dev test
./bin/dev test api
./bin/dev test web
./bin/dev test api -- --grep "travel desk"
```

### Database Operations

```bash
./bin/dev psql
./bin/dev psql-query "SELECT COUNT(*) FROM users;"
./bin/dev migrate up
./bin/dev migrate down
./bin/dev migrate make create-table-name
```

For SQL containing quotes or multiline text, pipe it into `psql`:

```bash
cat <<'SQL' | ./bin/dev psql
SELECT id, last_name
FROM users
ORDER BY id DESC
LIMIT 5;
SQL
```

### GitHub Helpers

```bash
./bin/dev branch-from https://github.com/icefoganalytics/travel-authorization/issues/218
./bin/dev description-from https://github.com/icefoganalytics/travel-authorization/issues/218
./bin/dev edit-pr https://github.com/icefoganalytics/travel-authorization/pull/371
```

### Design Helper

```bash
./bin/dev plantuml-to-png diagram.wsd
```

This expects the local PlantUML service to be running, for example via:

```bash
COMPOSE_PROFILES=design ./bin/dev up
```

## Notes

- `./bin/dev check-types` now runs both API and web type checks
- `./bin/dev psql` connects using the database container's configured environment
- `./bin/dev psql-query` is useful for quick one-line queries without entering interactive mode
- `./bin/dev help` prints the command list from the script itself
