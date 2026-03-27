# Travel Authorization

Travel Authorization is a full-stack travel authorization and approval system for the Yukon
Government.

## Overview

TravelAuth is built with:

- API: Node.js, Express, TypeScript, Sequelize, Knex, PostgreSQL
- Web: Vue 2, Vuetify 2, TypeScript, Vite
- Dev environment: Docker Compose with the `dev` wrapper
- Tests: Vitest with Fishery factories

## Key Services

### Frontend

- Browser app: `http://localhost:8080`
- See [web/README.md](./web/README.md) for frontend-specific guidance

### API

- Browser entry point: `http://localhost:3000`
- See [AGENTS.md](./AGENTS.md) for backend architecture and testing conventions

### Database

- Database engine: [PostgreSQL](https://www.postgresql.org/docs/current/index.html)
- Local orchestration: [Docker Compose](https://docs.docker.com/compose/)
- Database CLI: `dev psql`

### Mail Server

- Local mail UI: `http://localhost:1080`

If you are new to the project, start here, then read:

1. [AGENTS.md](./AGENTS.md) for project-wide conventions and architecture
2. [web/README.md](./web/README.md) for frontend-specific guidance
3. [api/README.md](./api/README.md) for backend-specific guidance
4. [api/tests/README.md](./api/tests/README.md) for API testing patterns
5. [agents/README.md](./agents/README.md) for AI workflows and plans

## Quick Start

1. Create any local environment files your setup requires.
   The main development values live in `.env.development` files that are not committed.

2. Add the minimum Auth0 development values in `api/.env.development`:

   ```bash
   AUTH0_DOMAIN=https://dev-0tc6bn14.eu.auth0.com
   AUTH0_AUDIENCE=testing
   ```

3. Start the full stack:

   ```bash
   dev up
   ```

4. Open the app at `http://localhost:8080`
5. The backend API is available at `http://localhost:3000`
6. The local mail viewer is available at `http://localhost:1080`

If you do not use `dev`, use:

```bash
docker compose -f docker-compose.development.yml up
```

## Common Commands

```bash
dev up
dev up api
dev up web
dev up db
dev down
dev down -v
dev psql
dev test_api
dev test_web
dev migrate up
dev migrate down
dev migrate make create-table-name
```

## Development Notes

- Migrations and seeds run during normal boot.
- Database tables use `snake_case`; models use `camelCase`.
- Auth0 in development requires third-party cookies to be allowed in the browser.
- The `dev` wrapper is the preferred way to run local services and project commands.
- Use `@/` import aliases for source imports in both API and web code.
- Test files mirror source structure:
  `api/src/services/example.ts` -> `api/tests/services/example.test.ts`

## Testing

- Run API tests with `dev test_api`
- Run web tests with `dev test_web`

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
