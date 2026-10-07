# Travel Authorization

Travel Authorization is a full-stack travel authorization and approval system for the Yukon
Government.

## Overview

TravelAuth is built with:

- API: Node.js, Express, TypeScript, Sequelize, Knex, PostgreSQL
- Web: Vue 3, Vuetify 3, TypeScript, Vite
- Dev environment: Docker Compose with the `dev` wrapper
- Tests: Vitest with Fishery factories

## Key Services

### Local Services

- Browser app: checkout-derived `*.travel-authorization.localhost` gateway hostname
- API: matching `api.` gateway hostname
- Databases: gateway routes PostgreSQL on port 5432 and TravCom Microsoft SQL Server on port 1433

The `dev` wrapper starts or reuses the shared Local Development Gateway and derives the hostname
from the checkout name. The main checkout uses `http://travel-authorization.localhost`; a worktree
named `issue-123` uses `http://issue-123.travel-authorization.localhost`.

Set `GATEWAY_HOSTNAME` before invoking `dev` to override the derived hostname for a local
environment.

For a database client outside Compose, connect to `db.<gateway-hostname>:5432` for PostgreSQL or
`db-trav-com.<gateway-hostname>:1433` for TravCom SQL Server. The gateway presents those TLS
hostnames only on loopback; Compose services continue to use their internal `db` and `db_trav_com`
aliases.

See [web/README.md](./web/README.md) for frontend-specific guidance and
[AGENTS.md](./AGENTS.md) for backend architecture and testing conventions.

If you are new to the project, start here, then read:

1. [AGENTS.md](./AGENTS.md) for project-wide conventions and architecture
2. [web/README.md](./web/README.md) for frontend-specific guidance
3. [api/README.md](./api/README.md) for backend-specific guidance
4. [api/tests/README.md](./api/tests/README.md) for API testing patterns
5. [agents/README.md](./agents/README.md) for AI workflows and plans

## Quick Start

1. Create any local environment files your setup requires.
   The main development values live in `.env.development` files that are not committed.

2. Install the Ruby development dependency:

   ```bash
   bundle install
   ```

3. Add the minimum Auth0 development values in `api/.env.development`:

   ```bash
   AUTH0_DOMAIN=https://dev-0tc6bn14.eu.auth0.com
   AUTH0_AUDIENCE=testing
   ```

4. Start the full stack:

   ```bash
   dev up
   ```

5. Open the checkout-derived gateway hostname.

Use `dev` rather than raw `docker compose` commands. The wrapper derives worktree-specific gateway
hostnames, starts or reuses the gateway, and stops it only when no participating project remains.

## Common Commands

```bash
dev up
dev up api
dev up web
dev up db
dev down
dev down -v
dev psql
dev migrate up
dev migrate down
dev migrate make create-table-name
```

## Development Notes

- Migrations and seeds run during normal boot.
- The frontend waits for the public `/_status` endpoint before starting in Docker development.
- Database tables use `snake_case`; models use `camelCase`.
- Auth0 in development requires third-party cookies to be allowed in the browser.
- The `dev` wrapper is the preferred way to run local services and project commands.
- `dev up` starts a small host-side editor bridge for Vue Devtools **Open in Editor**, and
  `dev down` stops it again.
- The Local Development Gateway owns loopback ports 80, 5432, and 1433. Project services remain
  internal to Docker and are reachable through their checkout-derived gateway hostnames.
- Use `@/` import aliases for source imports in both API and web code.
- Test files mirror source structure:
  `api/src/services/example.ts` -> `api/tests/services/example.test.ts`

## Testing

- See [bin/README.md](./bin/README.md#testing) for the canonical test commands.

See [api/tests/README.md](./api/tests/README.md) for backend testing conventions.
See [web/tests/README.md](./web/tests/README.md) for the frontend test directory overview.

## Design Support

If you want the PlantUML design service locally:

```bash
COMPOSE_PROFILES=design dev up
```

It is then available at `http://localhost:9999`.

## Migrations

Create a migration with:

```bash
dev migrate make migration-name
```

Run migrations with:

```bash
dev migrate up
dev migrate down
```

## Troubleshooting

If you see repeated `Login required` errors in the browser console during development, disable
enhanced tracking protection or other third-party cookie blocking for the app. Auth0 development
login depends on third-party cookies.

If Vue Devtools **Open in Editor** fails while running the frontend in Docker:

- Prefer `dev up` over raw `docker compose up` so the host-side bridge starts automatically.
- On Linux, make sure you also include `docker-compose.development.linux.yml` when running Docker
  Compose manually.
- The bridge prefers `OPEN_IN_EDITOR_COMMAND`, then `EDITOR`, and returns an error if neither is set.

## Build And Deploy

For local production-style testing, use the top-level `Dockerfile`, `docker-compose.yml`, and a
top-level `.env` file with the required production values.

At minimum, that includes database configuration plus any external integration values required for
the path you are testing.

## Documentation

Use the nearest README or workflow for area-specific guidance instead of expanding this file with
detailed implementation instructions.

- [AGENTS.md](./AGENTS.md) - project-wide conventions, architecture, and PR guidance
- [api/README.md](./api/README.md) - API service overview and usage
- [web/README.md](./web/README.md) - web service overview and usage
- [api/tests/README.md](./api/tests/README.md) - API testing guide
- [web/tests/README.md](./web/tests/README.md) - web testing directory guide
- [agents/README.md](./agents/README.md) - AI workflow, plan, and template discovery
