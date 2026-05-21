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

This section is the canonical source for local test commands. Other docs should link here instead
of duplicating test command examples.

```bash
./bin/dev test
./bin/dev test api
./bin/dev test web
./bin/dev test api -- --run tests/services/travel-desk-travel-requests/options-provided-service.test.ts
./bin/dev test api -- --grep "travel desk"
```

Pass Vitest flags after `--` so they are forwarded to the underlying test runner.

### Test Container Management

**Only one test container can run at a time** — running two causes database deadlocks. Before starting
`./bin/dev test api`, check for an existing test container and either reuse that run or wait for it to finish.

- Check containers with `docker ps --format "{{.Names}}\t{{.Status}}" | rg "test_api"`
- Check local test processes with `ps -ef | rg "npm run test|node \\(vitest"`

**When a container is already running**, watch its logs instead of starting a duplicate:

```bash
# Watch for the user's test container and tail its logs (run in background)
while true; do
  CONTAINER=$(docker ps --format '{{.Names}}' | grep test_api | head -1)
  if [ -n "$CONTAINER" ]; then
    docker logs -f "$CONTAINER" 2>&1
    break
  fi
  sleep 0.5
done
```

**Important constraint:** Do not start a second `./bin/dev test api` command while another API test
run is still active, even if you are targeting a different file set or using `--maxWorkers 1`.
If you need to validate multiple files, pass all of those file paths to one test command and let
that single Vitest instance run them sequentially.

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
