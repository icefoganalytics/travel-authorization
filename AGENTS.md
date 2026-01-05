# TravelAuth

TravelAuth is a full-stack travel authorization and approval system for the Yukon Government, streamlining the process of requesting, reviewing, and approving travel funding requests.

This file follows the format from https://agents.md/ for AI agent documentation.

**Documentation philosophy:** This file focuses on patterns, conventions, and architecture rather than documenting specific features or domain models. Examples illustrate patterns, not exhaustive feature documentation.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Development Environment](#development-environment)
  - [Common Commands](#common-commands)
  - [Conventions](#conventions)
- [Backend Patterns & Conventions](#backend-patterns--conventions)
  - [Code Style](#code-style)
  - [Architecture Patterns](#architecture-patterns)
  - [Testing](#testing)
- [Frontend Patterns & Conventions](#frontend-patterns--conventions)
  - [Code Style](#code-style-1)
  - [Component Naming Convention](#component-naming-convention)
  - [Architecture Patterns](#architecture-patterns-1)
- [General Concerns](#general-concerns)
  - [Security](#security)
  - [Configuration](#configuration)
  - [Pull Request Guidelines](#pull-request-guidelines)
- [Changelog Management](#changelog-management)

---

## Technology Stack

- **Backend:** Node.js + Express + TypeScript, PostgreSQL, Sequelize ORM, Knex migrations
- **Frontend:** Vue 2 + Vuetify 2 (migrating to Vue 3 + Vuetify 3), TypeScript
- **Testing:** Vitest, Fishery factories
- **Infrastructure:** Docker Compose

## Development Environment

### Common Commands

- `dev up` - Start all services (API at :3000, web at :8080, mail UI at :1080)
- `dev down -v` - Stop and wipe database
- `dev psql` - Access database CLI
- `dev test_api` - Run all API tests
- `dev migrate up` - Run migration
- `dev migrate down` - Rollback migration
- `dev migrate make create-table-name` - Create new migration

### Conventions

- Use `@/` import alias for src directory (both API and web)
- Database: snake_case, Models: camelCase (Sequelize handles mapping)
- Test files mirror source structure: `api/src/services/example.ts` → `api/tests/services/example.test.ts`

---

## Backend Patterns & Conventions

### Code Style

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`, or `!` (non-null assertion)
- Use optional chaining (`?.`) and nullish coalescing (`??`) for null handling
- 2 spaces, no semicolons, double quotes, 100 char line limit
- **No abbreviations:** Full descriptive names (`workflow` not `wf`)
- **Number similar entities:** `user1`, `user2` for clarity (not `existingUser`, `newUser`)
- **Expanded code style:** One thing per line, avoid terse functional chains
- **Guard clauses:** Early returns with blank line after each guard
- **Named constants:** Hoist magic numbers to named `const`
- camelCase for variables/functions, PascalCase for classes/types
- **Prettier formatting:** Let Prettier handle all formatting decisions (line wrapping, spacing, etc.)
  - Don't manually break lines or add leading `|` in union types
  - Prettier will automatically wrap based on line length configuration
  - Example: `Pick<Model, "id" | "name" | "email">` stays single-line until it exceeds print width

**Import ordering (PEP8-style):**

1. Node.js built-in modules
2. Blank line
3. External packages from node_modules
4. Blank line
5. Internal imports from `@/` (alphabetical preferred)

### Architecture Patterns

**Service Pattern:**

- Business logic in services extending `BaseService`
- Call via static method: `ServiceName.perform(args)` (never instantiate directly)
- Services call other services, not queries directly

**Controller Pattern:**

- RESTful controllers extending `BaseController`
- Standard CRUD: `index()`, `show()`, `create()`, `update()`, `destroy()`
- Routes: `GET /api/resources`, `GET /api/resources/:id`, `POST /api/resources`, etc.
- Authorization via `this.buildPolicy()` and `Policy.applyScope()`
- Serializers format output (IndexSerializer, ShowSerializer)
- Nested controllers in subfolders: `controllers/resource/action-controller.ts`

**Policy Pattern:**

- Authorization scoping via policy classes
- Role checks: Use `user.isAdmin` property directly

**Database:**

- Knex for migrations, Sequelize for ORM
- Database: snake_case, Models: camelCase (Sequelize maps automatically)

### Testing

**Running tests:**

- All tests: `dev test api`
- Specific file: `dev test api -- tests/services/example.test.ts --run`
- Watch mode: omit `--run`
- Pattern: `dev test api -- --grep "pattern"`

**Test structure:**

- Mirror source structure: `api/src/services/example.ts` → `api/tests/services/example.test.ts`
- Use `test` not `it`
- Nested describe blocks: file path → class name → method name
- AAA pattern with explicit comments: `// Arrange`, `// Act`, `// Assert`
- Test naming: `"when [condition], [expected behavior]"`
- Use Fishery factories for all test data

**Test patterns:**

- Numbered entities: `user1`, `user2` (not `existingUser`, `newUser`)
- Descriptive variable names: `workflowStepPlayersAttributes` not `playersAttributes`
- Assert database state via `findAll()` without where clauses (test isolation handles cleanup)
- Negative spy assertions: `expect(spy).not.toHaveBeenCalled()` (never use `not.toHaveBeenCalledWith`)
- Controller tests: `mockCurrentUser(user)` and `request().get("/api/path")` from `@/support`

**Common factories:**
Import from `@/factories`: `userFactory`, `travelAuthorizationFactory`, `expenseFactory`, `travelSegmentFactory`, etc.

---

## Frontend Patterns & Conventions

### Code Style

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`
- Vue 2 + Vuetify 2 (migrating to Vue 3 + Vuetify 3)
- 2 spaces, no semicolons, double quotes, 100 char line limit
- camelCase for variables/functions, PascalCase for components
- **Browser setTimeout:** Use `number` type, not `NodeJS.Timeout`
  - `const timer = ref<number | undefined>(undefined)`
  - `timer.value = setTimeout(callback, 1000)`

### Component Naming Convention

**Pattern:** `{Model}{Purpose}{VuetifyComponent}.vue`

1. **Model/Domain** - Primary data model (e.g., `FlightStatistics`, `TravelAuthorization`)
2. **Purpose** - Specific functionality (e.g., `Filters`, `Jobs`, `Edit`)
3. **Vuetify Component** - Wrapper component (e.g., `Card`, `Modal`, `Dialog`, `Select`)

**Directory structure:**

- Location: `/web/src/components/{model}/`
- Directories: kebab-case (e.g., `flight-statistics`)
- Files: PascalCase (e.g., `FlightStatisticsFiltersCard.vue`)

**Examples:**

- `FlightStatisticsFiltersCard.vue` - Filters card for flight statistics
- `FlightStatisticsJobsModal.vue` - Jobs modal for flight statistics
- `UserTravelDeskAgentSelect.vue` - Select for travel desk agent

### Architecture Patterns

**API Module Pattern:**
Type-safe API clients in `web/src/api/*-api.ts`

- Export types matching backend models/serializers
- Export `WhereOptions`, `FiltersOptions`, `QueryOptions` for query parameters
- Export API object with methods: `list()`, `get()`, `create()`, `update()`, `delete()`
- Methods return typed promises
- Example: `flightStatisticsApi.list(params)` → `Promise<{ flightStatistics: FlightStatisticAsIndex[], totalCount: number }>`

**Composable Pattern:**
Reactive data fetching in `web/src/use/use-*.ts`

_Plural form (`useResources`) for collections:_

- Accept `options` ref with query parameters, optional `skipWatchIf` function
- Return: `resources`, `totalCount`, `isLoading`, `isErrored`
- Provide: `fetch()` and `refresh()` methods
- Watch options with `deep: true, immediate: true`

_Singular form (`useResource`) for single items:_

- Accept `id` ref (can be `number | null | undefined`)
- Return: `resource`, `policy`, `isLoading`, `isErrored`
- Provide: `fetch()`, `refresh()`, optionally `save()`
- Watch id with `immediate: true`, skip if nil

_Chaining composables with computed IDs:_

When you need to fetch a detail record based on a list lookup, chain composables using a computed ID:

```typescript
const resourcesQuery = computed(() => ({
  where: {
    name: props.name,
  },
}))
const { resources } = useResources(resourcesQuery, {
  skipWatchIf: () => !isReady.value,
})
const resourceId = computed(() => resources.value[0]?.id)

const { resource } = useResource(resourceId)
```

This leverages Vue's reactivity - when `resources` updates, `resourceId` recomputes, triggering the singular composable to fetch automatically. Avoid manual watchers and imperative `fetch()` calls when reactive chaining suffices.

Re-export types, enums, and constants from API module for convenience.

---

## General Concerns

### Security

- Auth0 for authentication (requires third-party cookies in dev)
- All routes authenticated by default
- Use policy scoping for authorization
- Never commit secrets - use environment variables
- Parameterized queries prevent SQL injection

### Configuration

Environment files (not committed): `.env.development`, `.env.production`, `.env.test`

**Key variables:**

- `NODE_ENV`, `API_PORT`, `FRONTEND_URL`
- `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`
- `AZURE_KEY`, `YUKON_GOVERNMENT_FINANCE_API_KEY`
- Database: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT`

See `/api/src/config.ts` for complete details.

### Pull Request Guidelines

**Pre-submission:**

- All tests pass:
  - API: `./bin/dev api npm test` or `npm test` from `/api`
  - Web: `./bin/dev web npm test` or `npm test` from `/web`
- Type checking passes:
  - API: `./bin/dev api npm run check-types`
  - Web: `./bin/dev web npm run check-types`
- Linting passes:
  - API: `npm run lint` from `/api`
  - Web: `npm run lint` from `/web`
- Prettier formatting passes: `npx prettier --check .` from project root
- No `@ts-ignore`, `@ts-expect-error`, or `any` types
- Follow naming conventions (no abbreviations)
- Write tests for new functionality (AAA pattern)
- Never `git push --force` on main branch

**Testing Instructions Format:**

Standard setup (always include):

1. Run test suite: `dev test_api`
2. Boot app: `dev up`
3. Log in at http://localhost:8080

Navigation/verification steps:

- Use exact UI element names: **Add User**, **Activate Position**
- Reference menu locations: "top right dropdown nav", "left sidebar nav"
- Use navigation arrows: **Administration** → **Positions** → **Users** tab
- Explicit verification: "Verify success message: 'X created!'"
- Format: Bold for **UI elements**, inline code for `exact values/URLs/errors`

For complex scenarios, use `## Test Case N: Description` subheadings.

---

## Changelog Management

### Architecture

- Maintain a **single canonical `CHANGELOG.md` file in the origin repository**.
- Track **upstream history starting from `v2024.10.5.1`** using version sections:
  - `## [vYYYY.MM.DD.x] - YYYY-MM-DD`
- Use **`## [Unreleased]` for origin-only work**:
  - Describes changes on `origin/main` **since the latest upstream release tag**.
  - Do not create extra version sections for origin-only tags; move changes into a versioned section only when there is a corresponding upstream release.
- Keep `CHANGELOG.md` in **reverse chronological order** with `Unreleased` at the top.

### Versioning Scheme

- The changelog format is based on **Keep a Changelog** (https://keepachangelog.com/en/1.0.0/).
- Release tags and version headings use a **time-based version format**, not semantic versioning:
  - `vYYYY.MM.DD.i` (for example `v2025.11.25.1`).
  - These tags are generated by the `.github/workflows/docker-publish.yml` workflow using `tag_template: "yyyy.mm.dd.i"`.
- Changelog sections should match these time-based tags so that `## [vYYYY.MM.DD.x] - YYYY-MM-DD` aligns with the GitHub release and Docker image tags.

### Format and Content

- Follow **Keep a Changelog** structure:
  - `## [Unreleased]`
  - `## [version] - date`
  - Section headings:
    - `### Added`
    - `### Changed`
    - `### Deprecated`
    - `### Fixed`
    - `### Removed`
    - `### Security`
- Focus on **user-impacting and product-owner-relevant changes**:
  - Group low-level commits into a few high-level bullets.
  - Use a single bullet such as "Developer improvements to tests, migrations, and logging" for large batches of internal changes.
  - Avoid commit-log style listings and internal-only implementation details.
- Include short **"Why?" explanations** for major technical changes:
  - Framework upgrades (for example Sequelize 7, Node 22).
  - New subsystems (for example funding reconciliations).
  - Schema changes and migrations.
- Use **clear, non-abbreviated language**:
  - Describe features in domain terms (for example "funding reconciliation feature", "user administration improvements").
  - Avoid table or variable abbreviations in entries.

### Origin vs Upstream Responsibilities

- **Upstream releases** define the official version numbers recorded in `CHANGELOG.md`.
- **Origin-only changes** always live under `Unreleased`:
  - Never create a version heading for an origin-only release.
  - Non-upstream work stays in `Unreleased` until it has been deployed as part of an upstream release.
- When an upstream release lands:
  - Move the relevant `Unreleased` bullets into a new version section for that upstream tag.
  - Update the `Unreleased` heading line to reference the new version (`Changes since vYYYY.MM.DD.x that will be included in the next release.`).

### Release Workflow

1. **Before tagging an upstream-aligned release**

   - Review `Unreleased` and group items into user-facing themes.
   - Remove overly detailed technical notes that only matter to developers.
   - Ensure breaking changes, migrations, and security improvements are clearly called out.

2. **At release time**
   - Add a new version section: `## [vYYYY.MM.DD.x] - YYYY-MM-DD`.
   - Move curated `Unreleased` bullets into the new section under the appropriate headings.
   - Optionally add a short "Highlights" subsection with 3–5 key bullets.
   - Reset `Unreleased` to reference the new version in its "Changes since …" line and leave it otherwise empty.

### Per-PR Expectations

- For any pull request that changes **user-visible behavior** or **database schema**:
  - Add at least one bullet to `## [Unreleased]` under the correct heading.
  - Write entries in user-facing language (what changed and why), not internal class or file names.
  - Add a brief "Why?" for new subsystems or migration-relevant changes.
  - Pure refactors and test-only changes **may be omitted per PR** and summarized later as a single "developer improvements" bullet during release preparation.

### Automation Hints

- Git commit messages already use **GitHub-style emojis**; these can be used to draft changelog entries:
  - `:sparkles:` → Added
  - `:bug:` / `:beetle:` → Fixed
  - `:recycle:` / `:hammer:` → Changed (refactor or structural change)
  - `:fire:` → Removed
  - `:lock:` → Security
- A helper script can:
  - Scan `git log` since the last upstream tag.
  - Group commits by emoji into provisional sections (`Added`, `Changed`, `Fixed`, and so on).
  - Output a **draft Unreleased block** that is then manually curated to remove noise and rephrase entries as user-focused bullets.
