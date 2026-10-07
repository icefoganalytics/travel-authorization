# Top-Level Bin Directory

## `dev` Command

The `dev` command is a small helper around Docker Compose plus a few TravelAuth-specific
development tasks.

## Set Up `dev`

`dev` requires Ruby 3.2 or newer and the repository Ruby dependencies:

```bash
bundle install
```

All Ruby development dependencies use full exact version pins in [Gemfile](../Gemfile) for reproducible local startup.

Basic usage:

1. Run it as `./bin/dev ...` from the repo root.
2. If you want to use `dev ...` instead, add `bin/` to your `PATH`.

All development `dev` commands apply `docker-compose.development.gateway.yml`, which defines
browser and database gateway routing. Use the checkout-derived `*.travel-authorization.localhost`
hostname rather than direct application ports.

`./bin/dev up` and development `run` commands (including API commands, migrations, and tests)
ensure the gateway is running before creating or starting services. One-off containers disable
Traefik discovery while database dependencies retain their gateway routes. Commands wait for the
child process so gateway lifecycle cleanup does not remove other projects' routes.

`./bin/dev stop` waits for the selected services to stop, then removes the gateway only if no
running workloads remain attached. It never starts an absent gateway and retains stopped application
containers and editor registrations; use `./bin/dev down` for full teardown.

Other fallback Compose commands pass through without gateway lifecycle handling. Initialize the
gateway with `./bin/dev up` before using them, and use `./bin/dev stop` or `./bin/dev down` for cleanup.

Set `GATEWAY_HOSTNAME` before invoking `dev` to use an explicit local browser and database hostname
instead of the checkout-derived default.

Compose project names preserve valid directory names and use the hashed checkout label when
normalization would otherwise collide. Set `COMPOSE_PROJECT_NAME` to select an explicit project.

Host editor integration uses the shared `open-in-editor-bridge` gem. See
[Open In Editor](../web/README.md#open-in-editor) for checkout sessions and configuration.

## Common Commands

### Docker Compose Operations

```bash
./bin/dev up
./bin/dev up api
./bin/dev up web
./bin/dev stop
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

**End-to-end tests** start the app stack in test mode, run against isolated test databases, and tear
the stack down after the run:

```bash
./bin/dev test end-to-end-tests    # run Playwright in Docker against the test stack
```

The command starts the dependent services from the standalone end-to-end configuration in a separate
Docker Compose project before running Playwright. The stack uses Docker's internal network and does
not publish host ports, so it cannot conflict with a running development stack.

See `api/end-to-end-tests/README.md` for the current coverage boundary and authenticated-test
prerequisites. The runnable suite currently enforces unauthenticated smoke checks; authenticated
wizard coverage remains an explicit skipped skeleton.

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
