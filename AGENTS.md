# TravelAuth

Full-stack travel authorization and approval system for the Yukon Government.

This file follows the format from https://agents.md/ for AI agent documentation.

**Documentation philosophy:** Focus on patterns, conventions, and architecture rather than documenting specific features or domain models. Less is more: prefer the smallest guidance that fully solves the problem. A thing is complete not when there is nothing left to add, but when there is nothing left to take away. When guidance becomes specific to a subsystem, move it into the nearest `README.md` or `agents/` workflow and link from here instead of letting this file become a dumping ground.

## Technology Stack

- **Backend:** Node/Express + TypeScript, Sequelize 7 (alpha) ORM + Knex 3 migrations, PostgreSQL 14
- **Frontend:** Vue 3 + Vuetify 3, TypeScript
- **Testing:** Vitest, Fishery factories
- **Infrastructure:** Docker Compose, Auth0 auth, Azure Blob Storage
- **External:** MSSQL container simulates TravCom system for flight booking data

## Useful Local Documentation

- [bin/README.md](bin/README.md) - full command reference
- [COMMITTING.md](COMMITTING.md) - commit, pull request, and testing-instruction guidance
- [api/README.md](api/README.md) - backend service overview
- [api/tests/README.md](api/tests/README.md) - API test patterns
- [api/src/controllers/README.md](api/src/controllers/README.md) - controller patterns
- [api/src/services/README.md](api/src/services/README.md) - service-layer patterns
- [api/src/policies/README.md](api/src/policies/README.md) - policy and scope patterns
- [api/src/serializers/README.md](api/src/serializers/README.md) - serializer patterns
- [api/src/models/README.md](api/src/models/README.md) - model patterns
- [api/src/queries/README.md](api/src/queries/README.md) - reusable query guidance
- [api/src/db/README.md](api/src/db/README.md) - migrations and database workflow
- [api/src/integrations/README.md](api/src/integrations/README.md) - integration guidance
- [web/README.md](web/README.md) - frontend service overview
- [web/src/components/README.md](web/src/components/README.md) - Vuetify/component patterns
- [web/src/api/README.md](web/src/api/README.md) - frontend API layer patterns
- [web/src/use/README.md](web/src/use/README.md) - composable patterns
- [agents/README.md](agents/README.md) - agent workflow discovery

## Development Environment

### Commands

Everything goes through `./bin/dev` (Ruby wrapper). All commands run inside Docker containers — no local Node install needed.

```bash
dev up                          # Start full stack (api:3000, web:8080, mail:1080)
dev up api                      # Start a single service
dev down -v                     # Stop + wipe database volume
dev psql                        # DB shell (travel_development)
dev psql-query "SELECT ..."     # Run SQL directly
dev migrate up                  # Run Knex migrations
dev migrate down                # Rollback
dev migrate make create-table-name

dev test                        # All API tests (default)
dev test api                    # Same
dev test web                    # All web tests
dev test api -- --run tests/services/example.test.ts   # Single file
dev test api -- --grep "pattern"                       # Filter by name

# CRITICAL: Only one test container at a time. Two concurrent test runs
# will deadlock on the database. Check with: docker ps | grep test_

dev check-types                 # Runs both api + web type checks
dev web npm run check-types     # Frontend-only type check
dev api npm run check-types     # Backend-only type check

npx prettier --check .          # From project root
npx prettier --write .          # Auto-fix formatting
```

### Conventions

- Use `@/` import alias for src directory (both API and web)
- Database: snake_case, Models: camelCase (Sequelize handles mapping)
- Test files mirror source structure: `api/src/services/example.ts` → `api/tests/services/example.test.ts`
- On Linux, the dev wrapper auto-includes `.linux.yml` override for `host.docker.internal:host-gateway`

---

## Backend Patterns & Conventions

### Code Style

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`, or `!` (non-null assertion)
- No abbreviations: full descriptive names (`workflow` not `wf`)
- When using acronyms in prose (commit messages, comments, docs), spell out the full term first at least once per block of text before using the acronym.
- Number similar entities: `user1`, `user2` for clarity (not `existingUser`, `newUser`)
- Expanded code style: one thing per line, avoid terse functional chains
- Guard clauses with blank line after each
- Hoist magic numbers to named `const`
- Error paths: `console.error(...)` before `snack.error(...)`
- camelCase for variables/functions, PascalCase for classes/types
- Prettier formatting: no semicolons, double quotes, printWidth 100, ES5 trailing commas

**Import ordering (PEP8-style):**

1. Node.js built-in modules
2. Blank line
3. External packages from node_modules
4. Blank line
5. Internal imports from `@/`
   Within internal imports, group by conceptual distance with blank lines between groups when helpful. Within each group, alphabetical ordering is preferred.

**Controller import ordering:** logger/config → Models → Policies → Services → Serializers → Controllers

### Architecture Patterns

Detailed backend guidance lives close to the code it governs (see links above).

**Request flow:**
```
Route → BaseController (instance) → Service (.perform()) → Model/Sequelize
         ├─ buildWhere() merges overridable + ?where params + non-overridable where
         ├─ buildOrder() wraps string cols with col() for SQL injection safety
         ├─ Policy via this.buildPolicy(record)
         └─ Serializer (AsIndex/AsShow/ReferenceSerializer)
```

- Controllers in subdirectories with PascalCase re-exports (e.g. `Forms.Estimates.GenerateController`)
- Per-action service files: `services/estimates/bulk-generate.ts` → class `BulkGenerate extends BaseService`
- Policies: `PolicyFactory(Model)` or `{Model}Policy`, static `policyScope(user)` method
- `MAX_PER_PAGE = 1000`, `DEFAULT_PER_PAGE = 10`. Passing `perPage=-1` returns up to MAX.

### Testing

See [`bin/README.md`](bin/README.md#testing) for canonical test commands. Use the `dev test ...` commands, not service-shell package commands.

- Fishery factories imported from `@/factories`
- Triple `describe`: file path → class → method
- AAA comments (`// Arrange`, `// Act`, `// Assert`)
- Use `test()`, not `it()`
- One strong assertion over many weak ones
- Mock cleanup automatic via `vite.config.mts` — no manual `vi.restoreAllMocks()`

---

## Frontend Patterns & Conventions

### Code Style

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`
- Vue 3 + Vuetify 3
- No abbreviations, expanded style, guard clauses (same as backend)
- **Props:** TypeScript generic `defineProps<{ prop: type }>()` with `withDefaults()` when defaults needed
- **setTimeout:** Use `number` type, not `NodeJS.Timeout`
- **Loading:** Use `isNil(data)` instead of boolean `isLoading` flags
- **Error notifications:** `console.error(...)` before `snack.error(...)`
- **Shared formatters:** Prefer `@/utils/formatters` over local inline formatters
- **Reactivity:** Use `toRefs(props)` when passing props to composables

**Import ordering (PEP8-style):** builtins → blank → externals → blank → `@/` internals. Within internals, group by conceptual distance (config → composables/helpers → components), then alphabetical.

### Component Naming Convention

`{Model}{Purpose}{VuetifyComponent}.vue` — e.g. `FlightStatisticsFiltersCard.vue`. Kebab-case directories under `web/src/components/{model}/`.

### Architecture Patterns

**Data flow:**
```
Page → Composable (use{Resource}) → API module ({domain}Api.list()) → http-client (Axios)
                                                                      ├─ qs with arrayFormat: "indices"
                                                                      ├─ Bearer token injected for /api/*
                                                                      └─ X-Full-Referrer header
```

- API modules expose `list/get/create/update/delete`, unwrap Axios at the boundary
- Composables accept reactive options refs with `deep: true, immediate: true` watchers
- Plural composable = collection, singular = record

**Route patterns:**
All routes are children of `DefaultLayout.vue`. Breadcrumb-enabled routes nest under `LayoutWithBreadcrumbs.vue`. Domain layouts: `TravelRequestLayout`, `ManageTravelRequestLayout`, `ExpenseProcessingLayout`, `ReportsLayout`, `FlightExpensesLayout`.

Route names use dotted URL-like paths: `"my-travel-requests/MyTravelRequestsPage"`. Page file paths mirror route paths under `web/src/pages/`. Catch-all `"/:pathMatch(.*)*"` → `NotFoundPage`.

**Sorting/Query pipeline:**
```
v-data-table sortBy → useVuetifySortByToSafeRouteQuery (serializes as "key_order")
    → URL query param → useVuetifySortByToSequelizeSafeOrder (splits nested keys on ".")
    → API buildOrder() wraps with col() → Sequelize ORDER
```

**Docker services:**
| Service | Purpose | Port |
|---------|---------|------|
| api | Express/TS backend | 3000 |
| web | Vue/Vuetify frontend | 8080 |
| db | PostgreSQL 14 | 5432 |
| db_trav_com | MSSQL 2022 (TravCom sim) | 1433 |
| test_api | API test container | — |
| test_web | Web test container | — |

**Toolchain quirks:**
- **Sequelize 7 alpha** + Knex 3 for migrations (separate tooling, not managed by Sequelize)
- **Two tsconfigs per service**: main + `tests/tsconfig.json` extending it
- Puppeteer/Chromium in production: `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- `NODE_TLS_REJECT_UNAUTHORIZED=0` in production Dockerfile
- Vue Devtools Open in Editor bridge requires `EDITOR` or `OPEN_IN_EDITOR_COMMAND` env var
- Production deploys as single Docker image (multi-stage build: api + web from same container)

---

## General Concerns

### Security

- Auth0 for authentication (requires third-party cookies in dev)
- All routes authenticated by default (guard runs on every route)
- Use policy scoping for authorization
- Never commit secrets - use environment variables

### Configuration

Environment files (not committed): `.env.development`, `.env.production`, `.env.test`

Key variables: `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AZURE_KEY`, database config, `NODE_TLS_REJECT_UNAUTHORIZED`. See `api/src/config.ts` for complete details.

### Pull Request Guidelines

See [`COMMITTING.md`](COMMITTING.md) for detailed commit message, PR description, and testing instructions guidance.

**Pre-submission:**
- All tests pass via `dev test`
- Type checking passes via `dev check-types`
- Prettier formatting passes: `npx prettier --check .`
- No `@ts-ignore`, `@ts-expect-error`, or `any` types
- Follow naming conventions (no abbreviations)
- Write tests for new functionality (AAA pattern)
- Never `git push --force` on main branch

---

## Changelog Management

- Single canonical `CHANGELOG.md` in origin repository
- Time-based versioning: `vYYYY.MM.DD.i`
- Origin-only work stays under `## [Unreleased]` — never create version headings for origin-only releases
- Write entries in user-facing language (what changed and why), not internal class or file names
- Pure refactors and test-only changes may be omitted per PR and summarized later as a single "developer improvements" bullet during release preparation

## Agent Workflow Patterns

See [`agents/README.md`](agents/README.md) and [`agents/workflows/README.md`](agents/workflows/README.md) for available workflows and usage patterns.

**Available workflows:**
- `pull-request-management-workflow.md` - Creating and editing well-structured PRs
- `convert-js-api-to-typescript-workflow.md` - Converting JavaScript APIs to TypeScript
- `convert-js-plural-composable-to-typescript-workflow.md` - Converting composables to TypeScript
- `convert-dialog-table-to-page-pattern-workflow.md` - Modernizing legacy UI patterns
- `testing-instructions-workflow.md` - Writing QA testing instructions
- `create-a-plan-workflow.md` - Creating structured implementation plans
