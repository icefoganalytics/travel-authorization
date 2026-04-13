# Plan: Web TypeScript Migration Completion

## Problem Statement

TravelAuth has already migrated most backend and frontend application code to TypeScript, but the
remaining JavaScript files for the web service are still spread across multiple frontend layers plus
a few build and test entry points. That creates inconsistent typing, slows refactors, and leaves
some shared helpers, API modules, and composables outside the project's normal TypeScript safety
net. We need a staged plan to finish migrating the remaining `web/` JavaScript files to TypeScript
without breaking runtime behavior, route wiring, or current frontend conventions.

## Current State Analysis

**Already Implemented:**
- Most frontend feature code and Vue SFCs are already using TypeScript patterns.
- This branch has already migrated several top-level `web/src/api/*` modules from JavaScript to
  TypeScript, including travel authorization action logs, pre-approval profiles, pre-approval
  submissions, pre-approvals, travel desk flight options, travel desk questions, and travel desk
  travel agencies.
- The codebase already has TypeScript-aware aliases, linting, and type-checking workflows in place.

**Not Yet Implemented:**
- `web/src` still contains 74 JavaScript files.
- The remaining frontend JavaScript is concentrated in these areas:
  - `web/src/use`: 29 files
  - `web/src/utils`: 30 files
  - `web/src/api`: 8 files
  - `web/src/controllers`: 2 files
  - Single-file leftovers in `config.js`, `urls.js`, `locales/`, `misc/`, and
    `modules/travelDesk/router/`
- `web/tests` still contains 3 JavaScript files.
- Tooling and config entry points still include:
  - `web/.eslintrc.cjs`
  - `web/babel.config.js`
  - `web/vite.config.js`

## Key Findings

1. This is a frontend-only migration plan. Backend code is relevant only as a contract reference
   when a web API client needs to match an existing serializer or model shape.
2. The largest migration risk is not syntax conversion. It is preserving inferred data contracts in
   composables, API modules, validators, and shared formatters that currently rely on loose
   JavaScript behavior.
3. This branch has already proven that API client migrations can surface backend contract gaps, so
   the rollout should verify backend serializer shapes during frontend migration even though the
   migration scope stays in `web/`.
4. Several remaining JavaScript files are thin barrels, config shims, or legacy helpers. Some
   should be deleted or folded into existing TypeScript modules instead of migrated one-for-one.
5. The best rollout order is by dependency direction: shared types and utilities first, then API
   clients, then composables/controllers/router wiring, then tests and tooling.
6. Because many remaining files are shared across routes and forms, each batch should be followed
   by targeted `check-types`, lint, and focused frontend test coverage rather than waiting for one
   large final validation pass.

## Execution Guidance

This plan is designed to be executed using the companion workflows in `agents/workflows/`. Each
phase maps to a specific workflow:

| Phase | Workflow to Use | When to Use It |
| --- | --- | --- |
| Phase 1-2, 5-6 (batch work) | `complete-web-typescript-migration.md` | Multiple related files, reachability checks, or cleanup work |
| Phase 3 (API clients) | `convert-js-api-to-typescript.md` | Single API file conversion |
| Phase 4 (composables) | `convert-js-singular-composable-to-typescript.md` or `convert-js-plural-composable-to-typescript.md` | Single composable conversion |
| Phase 7 (cleanup) | `complete-web-typescript-migration.md` | Remove migration-only artifacts and keep only durable guidance |

Before starting any phase, read the workflow file end-to-end. For each batch/slice, fill out the
`agents/templates/typescript-migration-slice.md` template to document scope and validation.

---

## Recommended Solution

### Phase 1: Inventory, Reachability, and Type Boundaries
**Implementation:**
- Confirm the final inventory of non-TypeScript files in `web/`, excluding `node_modules`,
  generated output, and third-party assets.
- Classify each file as one of: migrate, merge into existing TypeScript module, keep as JavaScript
  config temporarily, or delete if orphaned.
- For legacy frontend subtrees, verify reachability from routes, imports, or pages before migrating
  them. Delete orphaned files instead of modernizing unused code.
- Identify shared domain types currently duplicated across `web/src/api`, `web/src/use`, and
  formatter/validator helpers, and decide which API modules should become the canonical source of
  exported types.

**Benefits:**
- Prevents wasted migration work on dead files.
- Establishes clean ownership for shared types before conversions begin.
- Reduces the risk of repeatedly revisiting the same contracts during later phases.

### Phase 2: Shared Utilities, Formatters, Validators, and Low-Risk Helpers
**Implementation:**
- Migrate shared leaf modules in `web/src/utils/`, `web/src/utils/formatters/`,
  `web/src/utils/validators/`, `web/src/utils/use-route-query-transformers/`, and
  `web/src/misc/yukon_territory_polygon.js`.
- Replace implicit `unknown`/`any` style behavior with explicit parameter and return types.
- Consolidate duplicated formatter modules where JavaScript and TypeScript versions now overlap.
- Add or tighten tests around parsing and validation behavior before changing helper signatures.

**Benefits:**
- Converts the lowest-risk, highest-reuse surface area first.
- Gives later API and composable migrations typed building blocks.
- Exposes weak data assumptions early, when blast radius is smaller.

### Phase 3: Frontend API Client Migration
**Implementation:**
- Treat the current branch's converted top-level API clients as the reference shape for the next
  migrations, and normalize any inconsistencies before using them as exemplars.
- Migrate all remaining files in `web/src/api/` to `*.ts`, including nested modules under
  `travel-authorizations/`, `travel-authorization-pre-approval-submissions/`, `qa/`, and
  `travel-desk-flight-options/`.
- Ensure each module exports request/response types and query option types that match backend
  serializers and controller responses.
- When a frontend migration exposes an untyped or inconsistently named backend serializer, record
  that dependency and either align to the existing contract or schedule a separate backend cleanup.
- Normalize import style to repo conventions and re-export related types from API modules for
  composable consumers.
- Remove stale JavaScript index barrels where direct typed imports are clearer.

**Benefits:**
- Creates a typed contract layer for the rest of the frontend.
- Reduces repetitive local type definitions inside composables and components.
- Makes later frontend migrations more mechanical and less error-prone.

### Phase 4: Composables, Controllers, Router, and App Wiring
**Implementation:**
- Migrate all remaining files in `web/src/use/`, plus `web/src/controllers/*.js`,
  `web/src/modules/travelDesk/router/index.js`, `web/src/config.js`, and `web/src/urls.js`.
- For plural and singular composables, preserve existing patterns for `fetch`, `refresh`,
  `isLoading`, `isErrored`, and reactive argument watching.
- Use `toRefs(props)` and typed computed IDs where composables chain from list lookups to detail
  lookups.
- Replace ambiguous nullable handling with explicit types that match current loading-state
  conventions.
- Keep top-level constants near their related watchers/actions during migration rather than
  flattening every declaration to the top of the file.

**Benefits:**
- Finishes the highest-value application behavior layer.
- Makes route-driven and policy-driven UI behavior safer to change.
- Aligns the remaining composition API surface with established project conventions.

### Phase 5: Locale, Tests, and Support Files
**Implementation:**
- Migrate `web/src/locales/en.js` with explicit message object typing that still works with the
  existing i18n setup.
- Convert remaining parser tests and support helpers in `web/tests/` to TypeScript.
- Backfill targeted tests for modules whose migration required behavior-preserving type refactors,
  especially parsers, validators, and shared composables.
- If test tooling needs adaptation for `.ts` support in remaining directories, make those changes
  in the same batch rather than deferring them.

**Benefits:**
- Keeps the test suite aligned with the production code migration.
- Prevents JavaScript-only test helpers from becoming the next source of weak typing.
- Captures regressions in parsing and utility behavior before cleanup phases.

### Phase 6: Tooling and Enforcement Cleanup
**Implementation:**
- Decide whether `web/.eslintrc.cjs` should stay as a CommonJS config file or move to a supported
  typed/configured alternative. Do not force a TypeScript conversion if the toolchain does not
  benefit from it.
- Evaluate `web/babel.config.js` and `web/vite.config.js` for migration to `*.ts` only if the
  current build chain supports that cleanly.
- Add or tighten lint rules, file globs, and CI checks so new application code cannot reintroduce
  stray `.js` source files under `web/src` or `web/tests`.
- Remove temporary compatibility shims, duplicate barrels, and leftover JavaScript imports after the
  final batch lands.

**Benefits:**
- Finishes the migration with guardrails instead of relying on convention alone.
- Avoids spending time forcing TypeScript into config files where it adds little value.
- Leaves the repo in a stable state for future feature work.

### Phase 7: Migration Artifact Cleanup
**Implementation:**
- After the web migration is complete, remove migration-only plan, workflow, and template files that
  no longer provide ongoing value.
- Keep `convert-js-api-to-typescript.md` and the composable conversion workflows only if they still
  describe durable repo patterns beyond this migration.
- Remove `complete-web-typescript-migration.md` and `typescript-migration-slice.md` once they are no
  longer needed for active migration work, unless they have proven useful as stable guidance.
- If the template still has value after the migration, replace it with a durable template for a
  "good" web API pattern instead of keeping a migration-specific template around indefinitely.
- Update the workflow and template indexes so they do not point at retired migration artifacts.

**Benefits:**
- Prevents temporary migration scaffolding from becoming stale repository noise.
- Keeps only the guidance that remains useful after the migration is done.
- Encourages replacing temporary process docs with durable implementation patterns when appropriate.

## Decision Factors

1. Whether any remaining JavaScript files are orphaned and should be deleted instead of migrated.
2. Whether build-tool config files should count as in-scope TypeScript migrations or remain in
   their supported JavaScript/CommonJS format.
3. How much shared type extraction should happen up front versus opportunistically during API module
   migrations.
4. Which migration batches can be safely shipped independently without creating inconsistent import
   paths or duplicate JS/TS module pairs.
5. How strict CI enforcement should become immediately after the migration versus in a follow-up
   cleanup PR.

## Recommended Action

Start with a cleanup PR that completes Phase 1 and Phase 2 using the
`complete-web-typescript-migration.md` workflow, because that work will identify dead files,
stabilize shared helpers, and lower the risk of every later migration. Fill out the
`typescript-migration-slice.md` template for this batch to document what was deleted vs. converted.

Then ship the remaining work in two focused slices:

1. **API clients plus dependent composables** - Use `convert-js-api-to-typescript.md` for each API file, then the singular/plural composable workflows for dependent use modules.
2. **Remaining app wiring, tests, and tooling cleanup** - Return to
   `complete-web-typescript-migration.md` for the final batch.
3. **Migration artifact cleanup** - Finish with Phase 7 by removing temporary migration plans,
   workflows, and templates, or by replacing the template with a durable "good web API pattern"
   template if it remains useful.

Treat config files as a separate decision point instead of forcing them into the same definition of "all files" if the underlying tools still prefer JavaScript or CommonJS.

## Files To Review

1. `web/src/api/` - Remaining JavaScript API clients that should become canonical typed contracts.
2. `web/src/use/` - Remaining JavaScript composables that depend on API response and query types.
3. `web/src/utils/` - Shared helpers, parsers, validators, and query transformers.
4. `web/src/controllers/` - Frontend controller shims that still need typed exports.
5. `web/src/modules/travelDesk/router/index.js` - Route wiring that may expose legacy imports.
6. `web/src/config.js` - Shared frontend config entry point.
7. `web/src/urls.js` - Route and URL helper definitions that may be widely imported.
8. `web/src/locales/en.js` - Locale object typing and message export shape.
9. `web/tests/` - Remaining JavaScript tests and support helpers.
10. `web/vite.config.js` and `web/babel.config.js` - Build-tool config migration feasibility.
11. `web/.eslintrc.cjs` - Lint-config scope and typed-config feasibility.

## Out Of Scope

- Backend source migrations or serializer refactors beyond what is needed to understand frontend
  response shapes.
- Large feature refactors unrelated to type migration.
- Converting third-party assets, generated files, or `node_modules` contents.
- Broad UI redesigns or route reorganization unless required to delete an orphaned legacy subtree.

## Related Issues

- PR #360: https://github.com/icefoganalytics/travel-authorization/pull/360

---

## Companion Resources

When executing this plan, use these files:

**Workflows (agents/workflows/):**
- `complete-web-typescript-migration.md` - Batch migration workflow for multiple files, reachability checks, and cleanup
- `convert-js-api-to-typescript.md` - Single API file conversion with types and enums
- `convert-js-singular-composable-to-typescript.md` - Single resource composable conversion (useUser, useExpense)
- `convert-js-plural-composable-to-typescript.md` - List composable conversion (useUsers, useExpenses)
- `pull-request-management.md` - PR creation and editing following project conventions
- `testing-instructions.md` - Generate testing instructions for PRs

**Templates (agents/templates/):**
- `typescript-migration-slice.md` - Scope and execute one batch of migration work

**Related Documentation:**
- `AGENTS.md` - Project-wide conventions and patterns
