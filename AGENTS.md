# TravelAuth

Full-stack travel authorization and approval system for the Yukon Government.

This is the project overlay on [Marlens Skills, Rules, and Tools](https://github.com/klondikemarlen/marlens-skills-rules-and-tools). Read the linked shared owner before applying its guidance; a link does not install a skill or activate a verifier.

## Shared Standards and Local Authority

- [Guidance precedence](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/guidance-precedence-reference.md) governs the shared base. TravelAuth's local contracts, commands, and explicit conventions below remain authoritative; shared guidance is not a retroactive migration.
- [Human readability](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/code-organization-reference.md#human-readability) owns descriptive names, expanded control flow, guard clauses, and maintainability. Keep subsystem details in their nearest README rather than duplicating that standard here.
- [Backend rails](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/express-light-rail-backend-workflow.md) supply the generic route/controller/policy/service/serializer model. Use the local backend READMEs and bases; [library adoption prerequisites](api/README.md#shared-backend-library-adoption) are a separate compatibility gate.
- [Feature delivery](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/feature-workflow.md) supplies issue-to-merge discipline. [COMMITTING.md](COMMITTING.md) and the [local PR overlay](agents/workflows/pull-request-management-workflow.md) own TravelAuth's contribution and description contracts.
- [Agent discovery](agents/README.md) routes tasks to shared owners and local overlays, including learner ownership.

Preserve the import, type, and test conventions below until explicitly reconciled. [Draft #394](https://github.com/icefoganalytics/travel-authorization/pull/394) owns further import/export and test-policy changes; do not restore copied generic workflow text when integrating it. [#417](https://github.com/icefoganalytics/travel-authorization/issues/417) owns screenshot-workflow reconciliation; use the existing local PR/screenshot entrypoints rather than creating parallel instructions. Async composable proposals are not adopted policy and do not authorize form or composable rewrites.

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

Everything goes through `./bin/dev` (Ruby wrapper); development and test commands run inside Docker. [bin/README.md](bin/README.md) owns actual commands, gateway lifecycle, database selection, and test-container isolation. Use its [testing section](bin/README.md#testing), not service-shell package commands. Only one API test container may run at a time.

The standard PR setup remains:

1. Run the relevant test suite using the [canonical commands](bin/README.md#testing).
2. Boot the app via `./bin/dev up`.
3. Log in using the browser URL printed by Vite at startup (honors `GATEWAY_HOSTNAME`).

See [README.md](README.md#local-services) for browser and TLS database gateway addresses.

### Conventions

- Use `@/` import alias for src directory (both API and web)
- Database: snake_case, Models: camelCase (Sequelize handles mapping)
- Test files mirror source structure: `api/src/services/example.ts` → `api/tests/services/example.test.ts`
- On Linux, the dev wrapper includes an optional `docker-compose.<environment>.linux.yml` when present.
- For editor-enabled startup, the gem's Compose adapter supplies `host.docker.internal:host-gateway` and read-only Vite integration mounts; no editor-specific Linux override is needed.

---

## Backend Patterns & Conventions

### Code Style

- TypeScript only - never introduce `any`, `@ts-ignore`, or `!` (non-null assertion) without
  asking first
- Do not use `@ts-expect-error` without asking first; if permitted, always include a comment
  explaining the gap
- No abbreviations in code: use full descriptive names.
- Expanded code style: one thing per line, avoid terse functional chains.
- Spell out acronyms in prose at least once per block; use numbered peer entities such as `user1`, `user2`.
- Separate guard clauses with a blank line; hoist magic numbers to named `const`.
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

Use [api/tests/README.md](api/tests/README.md) for the backend test overlay and [web/tests/README.md](web/tests/README.md) for the frontend test contract. They retain TravelAuth's Fishery setup, mirrored paths, nested `describe` hierarchy, `test()` naming, Arrange/Act/Assert comments, assertion conventions, and automatic mock cleanup.

---

## Frontend Patterns & Conventions

### Code Style

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`
- Vue 3 + Vuetify 3
- Use the backend naming, expanded-style, and guard-spacing conventions above.
- **Props:** TypeScript generic `defineProps<{ prop: type }>()` with `withDefaults()` when defaults needed
- **setTimeout:** Use `number` type, not `NodeJS.Timeout`
- **Loading:** Use `isNil(data)` instead of boolean `isLoading` flags
- **Error notifications:** `console.error(...)` before `snack.error(...)`
- **Shared formatters:** Prefer `@/utils/formatters` over local inline formatters
- **Reactivity:** Use `toRefs(props)` when passing props to composables
- **Event handler naming:** Name by effect, not trigger. Use `refreshAndEmitChangesRequested` over `handleChangesRequested`, `openExpenseRejectDialog` over `handleExpenseReject`. Describing the outcome makes the function reusable when a different trigger invokes the same behavior.

**Import ordering (PEP8-style):** builtins → blank → externals → blank → `@/` internals. Within `@/` internals, group by conceptual distance with blank lines between groups. The typical order is:

1. `@/utils` + `@/use/utils` (utility functions and composables — no blank line between them)
2. `@/api` (API types and values)
3. `@/use` (domain composables)
4. `@/components/common` (common UI components — always first within components)
5. `@/components/{domain}` (other components, alphabetical by path)

Within each group, alphabetical by import variable name is preferred.

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

Reuse existing shared libraries rather than copying or reimplementing their behavior.
Keep project-specific configuration in this repository.

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

- All tests pass via `dev test`.
- Type checking passes via `dev check-types`.
- Prettier formatting passes: `npx prettier --check .`.
- No `@ts-ignore`, `@ts-expect-error`, or `any` types
- Follow naming conventions (no abbreviations)
- Follow the affected test directory's local setup and assertion contract.
- Never `git push --force` on main branch

---

## Changelog Management

- Single canonical `CHANGELOG.md` in origin repository
- Time-based versioning: `vYYYY.MM.DD.i`
- Origin-only work stays under `## [Unreleased]` — never create version headings for origin-only releases
- Keep the changelog in Markdown, grouped by Added, Changed, Fixed, or Removed as applicable.
- Use concise release-note entries: name the affected task, what users can do or what now works, and any material limitation. Follow WRAP's outcome-focused prose, not its YAML storage format.
- Fold the reason into the outcome when useful; omit separate "Why?" paragraphs, promotional claims, and implementation inventories.
- Mention non-user-facing changes briefly, such as a single outcome-focused "developer improvements" bullet.
- Keep technical details in the project knowledge base (nearest README or reference), not changelog entries.

## Agent Workflow Patterns

See [`agents/README.md`](agents/README.md) and [`agents/workflows/README.md`](agents/workflows/README.md) for available workflows and usage patterns.
