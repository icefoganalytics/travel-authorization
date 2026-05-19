# TravelAuth

TravelAuth is a full-stack travel authorization and approval system for the Yukon Government, streamlining the process of requesting, reviewing, and approving travel funding requests.

This file follows the format from https://agents.md/ for AI agent documentation.

**Documentation philosophy:** This file focuses on patterns, conventions, and architecture rather than documenting specific features or domain models. Examples illustrate patterns, not exhaustive feature documentation.
Less is more: prefer the smallest guidance, implementation, or abstraction that fully solves the
problem. A thing is complete not when there is nothing left to add, but when there is nothing left
to take away.
Do not remove durable reference material that is hard to rediscover later, such as known-good test
inputs, sample payloads, or validated reference values.

Keep `AGENTS.md` focused on project-wide conventions and high-level concepts. When guidance becomes
specific to a subsystem or directory, move it into the nearest `README.md` or `agents/` workflow
document and link to it from here instead of letting this file become a dumping ground.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Useful Local Documentation](#useful-local-documentation)
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
  - [Agent Workflow Patterns](#agent-workflow-patterns)
- [Changelog Management](#changelog-management)

---

## Technology Stack

- **Backend:** Node.js + Express + TypeScript, PostgreSQL, Sequelize ORM, Knex migrations
- **Frontend:** Vue 3 + Vuetify 3, TypeScript
- **Testing:** Vitest, Fishery factories
- **Infrastructure:** Docker Compose

## Useful Local Documentation

- [README.md](README.md) - project overview and quick start
- [COMMITTING.md](COMMITTING.md) - commit, pull request, and testing-instruction guidance
- [bin/README.md](bin/README.md) - development wrapper commands
- [api/README.md](api/README.md) - backend service overview
- [api/tests/README.md](api/tests/README.md) - API testing patterns
- [api/src/controllers/README.md](api/src/controllers/README.md) - controller patterns
- [api/src/db/README.md](api/src/db/README.md) - migrations and database workflow
- [api/src/integrations/README.md](api/src/integrations/README.md) - integration guidance
- [api/src/models/README.md](api/src/models/README.md) - model patterns
- [api/src/policies/README.md](api/src/policies/README.md) - policy and scope patterns
- [api/src/queries/README.md](api/src/queries/README.md) - reusable query guidance
- [api/src/serializers/README.md](api/src/serializers/README.md) - serializer patterns
- [api/src/services/README.md](api/src/services/README.md) - service-layer patterns
- [web/README.md](web/README.md) - frontend service overview
- [web/tests/README.md](web/tests/README.md) - frontend test directory overview
- [web/src/api/README.md](web/src/api/README.md) - frontend API layer patterns
- [web/src/components/README.md](web/src/components/README.md) - component and Vuetify patterns
- [web/src/layouts/README.md](web/src/layouts/README.md) - layout guidance
- [web/src/modules/travel-authorizations/components/README.md](web/src/modules/travel-authorizations/components/README.md) - travel authorization module component guidance
- [web/src/modules/travel-authorizations/pages/README.md](web/src/modules/travel-authorizations/pages/README.md) - travel authorization module page guidance
- [web/src/pages/README.md](web/src/pages/README.md) - routeable page guidance
- [web/src/use/README.md](web/src/use/README.md) - composable patterns
- [agents/README.md](agents/README.md) - agent workflow discovery
- [agents/plans/README.md](agents/plans/README.md) - plan naming and structure
- [agents/templates/README.md](agents/templates/README.md) - template discovery
- [agents/workflows/README.md](agents/workflows/README.md) - workflow discovery

## Development Environment

### Common Commands

- `dev up` - Start all services (API at :3000, web at :8080, mail UI at :1080)
- `dev down -v` - Stop and wipe database
- `dev psql` - Access database CLI (database name: `travel_development`)
- `dev psql-query "SELECT ..."` - Run a SQL query directly against the dev database
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
5. Internal imports from `@/`
   Within internal imports, prefer grouping by conceptual distance with blank
   lines between groups when helpful. Within each group, alphabetical ordering is preferred.

**Controller import ordering:**

Within internal imports for controllers, group by conceptual distance:

- Utilities (logger, config)
- Models
- Policies
- Services
- Serializers
- Controllers

### Architecture Patterns

Detailed backend guidance lives close to the code it governs:

- Controllers: [api/src/controllers/README.md](api/src/controllers/README.md)
- Services: [api/src/services/README.md](api/src/services/README.md)
- Policies: [api/src/policies/README.md](api/src/policies/README.md)
- Serializers: [api/src/serializers/README.md](api/src/serializers/README.md)
- Models: [api/src/models/README.md](api/src/models/README.md)
- Queries: [api/src/queries/README.md](api/src/queries/README.md)

**Database:**

- Knex for migrations, Sequelize for ORM
- Database: snake_case, Models: camelCase (Sequelize maps automatically)

### Testing

**Running tests:**

See [`bin/README.md`](bin/README.md#testing) for canonical test commands. Use the dedicated
`dev test ...` commands for test runs, not service-shell package commands.

See [api/tests/README.md](api/tests/README.md) for API test structure, factories, and assertion
patterns.

---

## Frontend Patterns & Conventions

### Code Style

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`
- Vue 3 + Vuetify 3
- 2 spaces, no semicolons, double quotes, 100 char line limit
- camelCase for variables/functions, PascalCase for components
- **Browser setTimeout:** Use `number` type, not `NodeJS.Timeout`
  - `const timer = ref<number | undefined>(undefined)`
  - `timer.value = setTimeout(callback, 1000)`
- **Props definition:** Prefer TypeScript generic style `defineProps<{ prop: type }>()` over object-style with type arrays
- **Props defaults:** When `script setup` props need defaults, prefer `withDefaults(defineProps<...>(), ...)` rather than relying on optional props plus template checks alone.
- **Shared formatters:** Prefer existing helpers from `@/utils/formatters` over creating local inline formatters in components. Reuse shared utilities first and only add a new formatter when no suitable one exists.
- **Loading states:** Use `isNil(data)` instead of boolean `isLoading` flags for more precise data presence checks
- **Reactivity:** Use `toRefs(props)` when passing props to composables to maintain ref types and reactivity
- **Optional chaining:** Only use `?.` when data might actually be null/undefined in rendered context, not when loading state ensures existence
- **Top-level const placement:** Keep top-level `const` declarations near the code that uses them. State, composables, refs, and computed values should be grouped by conceptual distance instead of all being hoisted to the top of `script setup`. Keep them top-level, but place them close to the watcher, computed, or action they support.
- **Import spacing:** Group imports as external packages, blank line, then internal `@/` imports. Within the internal section, prefer grouping by conceptual distance rather than one flat alphabetized block. Preserve visible spacing between groups in Vue SFC scripts.

**Component import ordering:**

Within internal imports for Vue components, group by conceptual distance:

- Config imports
- Composables/helpers
- Components
- Within each group, alphabetical ordering is preferred.
- **Default imports:** When a helper or component already exposes a default export and the module has a single clear purpose, prefer the default import form at the call site.
- **Expanded imports:** When importing 4 or more named items, prefer the expanded multi-line form for readability.
- **Composable usage in Options API:** When an Options API component needs a composable, call it inside `setup()` and return the result for use via `this.*`. Do not create composable instances at module scope.
- **Error notifications:** Use `console.error(...)` before `snack.error(...)` when handling a real error path. Do not log validation or other expected non-error user feedback with `console.error(...)`.
- **Legacy cleanup triage:** Before modernizing an isolated legacy frontend component or subtree, verify that it is still reachable from pages, routes, or imports. If it is orphaned, prefer deleting it over migrating it.
- **Code organization matters:** When modernizing frontend behavior, verify that the surrounding route placement, layout nesting, and file organization support the intended behavior. Matching a component API or route name is not enough if the page lives outside the layout or namespace that provides the feature.

### Vuetify 3 Patterns

See [web/src/components/README.md](web/src/components/README.md) for component and Vuetify
patterns.

### Component Naming Convention

See [web/src/components/README.md](web/src/components/README.md) for component naming and
directory conventions.

### Architecture Patterns

Detailed frontend guidance lives close to the code it governs:

- API modules: [web/src/api/README.md](web/src/api/README.md)
- Components and Vuetify: [web/src/components/README.md](web/src/components/README.md)
- Layouts: [web/src/layouts/README.md](web/src/layouts/README.md)
- Pages: [web/src/pages/README.md](web/src/pages/README.md)
- Composables: [web/src/use/README.md](web/src/use/README.md)

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

See [`COMMITTING.md`](COMMITTING.md) for detailed commit message, PR description, and testing
instructions guidance.

**Pre-submission:**

- All tests pass:
  - See [`bin/README.md`](bin/README.md#testing) for canonical API and web test commands
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

---

## Agent Workflow Patterns

### Workflow Design Principles

**Codebase-wide search discipline:**

- Search for the **method or pattern**, not the variable name — variable names differ per file
- BAD: `form\.value\.validate` — misses `formRef`, `headerActionsFormCard`, `tripDetailsEstimatesEditForm`, etc.
- GOOD: `\.validate\(\)` — catches all call sites regardless of ref name
- When doing a codebase-wide pass, use the most general regex that captures the semantic pattern, then filter false positives manually

**Comprehensive Scoping:**

- Name workflows for their complete lifecycle (e.g., "pull-request-management" not "pull-request-creation")
- Cover all related activities: creation, editing, maintenance, and troubleshooting

**Tracked files and permissions:**

- Do not ask the user for permission to edit or delete a file that is already tracked by git.
- Do not trigger sandbox approval prompts for normal edits to tracked repository files.
- Prefer direct repository edits over any escalated command when the target file is inside the git worktree and writable.
- Only escalate or ask for approval when the action is genuinely outside normal repository editing, such as sandbox restrictions, network access, or destructive operations the user did not request.
- When moving or renaming tracked files, use `git mv` so git records the operation as an intentional relocation.

**Template/Workflow Separation:**

- Keep GitHub templates minimal with just structure
- Move detailed guidance, examples, and instructions to agent workflows
- Template = what to fill out, Workflow = how to fill it out

**Project-Specific Normalization:**

- When copying workflows between projects, normalize ALL project-specific details:
  - Commands: use the canonical test commands from `bin/README.md` instead of generic test commands
  - URLs: http://localhost:8080
  - Navigation patterns: **Travel Authorizations** → **Create New**
  - Naming conventions and code style

**Practical Examples:**

- Include real examples from the actual project, not theoretical patterns
- Show before/after scenarios and common use cases
- Use actual file names, component names, and patterns from the codebase

**Lifecycle Coverage:**

- Consider the full lifecycle of the activity, not just initial creation
- Include editing, updating, and maintenance scenarios
- Provide troubleshooting and common pitfall guidance

**QA Testing Instructions:**

- Write for someone with zero project knowledge
- Focus on UI interactions: "Click on", "Verify", "Fill out"
- Use simple, sequential steps with specific verification points
- Test complete user workflows: creation, editing, saving, navigation
- Include browser behavior testing: back button, refresh, direct URLs
- Minimal bolding - only for UI elements, avoid technical jargon

### Available Workflows

See `/agents/workflows/README.md` for the complete list of available workflows and their usage patterns.

**Key Workflows:**

- `pull-request-management.md` - Creating and editing well-structured PRs
- `convert-js-api-to-typescript.md` - Converting JavaScript APIs to TypeScript
- `convert-js-plural-composable-to-typescript.md` - Converting composables to TypeScript
- `convert-dialog-table-to-page-pattern.md` - Modernizing legacy UI patterns

### Workflow Usage

**Example:**

```
Follow the workflow in agents/workflows/pull-request-management.md
to create a comprehensive pull request following TravelAuth patterns.
```

Workflows are designed to be used with AI coding assistants and provide step-by-step guidance for complex, multi-step processes.
