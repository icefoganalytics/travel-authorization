# Top-Level Bin Directory

## `dev` Command

The `dev` command is a small helper around Docker Compose plus a few TravelAuth-specific
development tasks.

Keep `dev` thin and readable. Prefer direct calls and pass caller options through unchanged;
leave option semantics to Docker Compose and shared gems rather than adding compatibility parsing.
Use the normal repository-root setup and let missing prerequisites fail clearly instead of
adding alternate startup paths or dependency-discovery workarounds.

## Set Up `dev`

`dev` requires Ruby 3.2 or newer and the repository Ruby dependencies:

```bash
bundle install
```

All Ruby development dependencies use full exact version pins in [Gemfile](../Gemfile) for reproducible local startup.

The wrapper activates Bundler before loading Ruby libraries. Preserve that order to avoid
unresolved-specification warnings from globally installed RDoc dependencies.

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

Compose project names preserve valid directory names up to 51 characters. Longer or normalized
names use a bounded prefix and stable digest, leaving room for the longest database alias.
Browser hostnames retain their separate 63-character label limit.
Set `COMPOSE_PROJECT_NAME` to select an explicit project of at most 51 characters; longer overrides
fail before Compose runs rather than silently selecting different volumes.
If an existing checkout's derived project name changes, preserve its data before adopting the new
identity; the old named volumes remain under the previous project name.

Host editor integration uses `open-in-editor-bridge` 0.3.0, installed by `bundle install` for the
active Ruby. Run `dev` from the repository root so Bundler finds the project's Gemfile normally.
Configure `OPEN_IN_EDITOR_COMMAND` or `EDITOR` before `dev up`; the gem reports a missing editor.
See [Open In Editor](../web/README.md#open-in-editor) for lifecycle, shared-runtime, and
trusted-network configuration. Use `dev up`, not raw Compose, to create containers with the
gem's editor mounts.

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

The project pins [Local Development Gateway 0.2.2](https://github.com/icefoganalytics/local-development-gateway/tree/v0.2.2).
Its [development/test connection contract](https://github.com/icefoganalytics/local-development-gateway/blob/v0.2.2/README.md#canonical-development-and-test-compose-pattern)
separates private application aliases from encrypted desktop routes. API, migration, and test
containers use `${COMPOSE_PROJECT_NAME}-db` and `${COMPOSE_PROJECT_NAME}-db_trav_com`; test containers
retain `travel_test` and `trav_com_test`. Both databases have private aliases and gateway ingress,
with no published database ports in the development base.

After adopting this configuration, run `bundle install`, then recreate this checkout's database
and consumer services with `./bin/dev up -d db db_trav_com api web`. Keep existing named volumes.
A new installed gem can reuse an older healthy shared router: inspect its active library mount
with `docker inspect local-gateway-database-router-1` and compare it with
`bundle info local-development-gateway --path`. Coordinate any shared-router restart with other
projects; it interrupts their database sessions.

Use `./bin/dev config` to inspect the merged configuration locally without publishing credentials.
All current development wrapper commands, including tests, select the gateway overlay.
For a base-only configuration check, retain the same `COMPOSE_PROJECT_NAME` and render
`docker compose -f docker-compose.development.yml config`. Both forms must preserve qualified
hosts and private aliases without publishing database ports. If a base-only command recreates
dependencies, run `./bin/dev up -d db db_trav_com` afterward to restore gateway attachments.

Verify real consumers rather than relying only on a database-local console:

- From the API and test contexts, query PostgreSQL with
  `SELECT current_database(), inet_server_addr();` and SQL Server with
  `SELECT DB_NAME(), @@SERVERNAME;`. Compare with the explicitly selected database containers;
  test contexts must select the test databases.
- Keep another checkout running, stop only the owned database, and verify its consumer fails
  rather than selecting the other checkout. Restore the owned service afterward.
- Connect through each desktop hostname with encryption and SNI enabled; verify its identity,
  cancel a PostgreSQL `pg_sleep` query, and confirm that session remains usable.

The `psql` commands below deliberately select this checkout's PostgreSQL container and use its
local connection. Migrations run from the API through the qualified private alias.

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
