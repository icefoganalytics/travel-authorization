# Plan: Web API TypeScript Migration Completion

## Problem Statement

TravelAuth has already migrated much of the frontend API layer to TypeScript, but `web/src/api`
still contains a small set of JavaScript modules. Those files remain an awkward gap in the
frontend's typed contract layer, especially because composables and components depend on them as the
canonical source for request, response, and query-option types. We need a staged plan to finish
migrating the remaining `web/src/api` JavaScript files to TypeScript without drifting from backend
serializer shapes or leaving mixed JS/TS API conventions behind.

## Current State Analysis

**Already Implemented:**
- Most top-level API modules in `web/src/api` are already TypeScript.
- This branch has already migrated several API clients, including travel authorization action logs,
  pre-approval profiles, pre-approval submissions, pre-approvals, travel desk flight options,
  travel desk questions, and travel desk travel agencies.
- The API conversion workflow in `agents/workflows/convert-js-api-to-typescript.md` already captures
  the expected `AsIndex` / `AsShow`, enum, and query-option patterns.
- Recent branch work has shown the right contract pattern when API responses depend on backend
  serializers with associations.

**Not Yet Implemented:**
- `web/src/api` still contains 8 JavaScript files:
  - `web/src/api/flight-reconciliations-api.js`
  - `web/src/api/http-client.js`
  - `web/src/api/qa/scenarios-api.js`
  - `web/src/api/travel-authorization-pre-approval-submissions/index.js`
  - `web/src/api/travel-authorization-pre-approval-submissions/pre-approvals-api.js`
  - `web/src/api/travel-authorizations/estimates/generate-api.js`
  - `web/src/api/travel-authorizations/expenses/prefill-api.js`
  - `web/src/api/travel-desk-flight-options/re-order-flight-segments-api.js`
- Some of the remaining files are leaf API clients, while others are barrels or infrastructure
  helpers that may be better merged or simplified instead of converted one-for-one.

## Key Findings

1. This plan should cover `web/src/api` only. Remaining `web/src/use`, `web/src/utils`, tests, and
   config files belong in separate plans or later work.
2. The largest risk is not syntax conversion. It is preserving the typed contract boundary between
   backend responses and frontend consumers.
3. The remaining API files fall into three practical categories:
   - transport/infrastructure: `http-client.js`
   - leaf API modules: `flight-reconciliations-api.js`, `qa/scenarios-api.js`,
     `travel-authorizations/estimates/generate-api.js`,
     `travel-authorizations/expenses/prefill-api.js`,
     `travel-desk-flight-options/re-order-flight-segments-api.js`
   - barrels/nested API entry points:
     `travel-authorization-pre-approval-submissions/index.js`,
     `travel-authorization-pre-approval-submissions/pre-approvals-api.js`
4. The best rollout order is infrastructure first, then leaf API modules, then barrels and nested
   entry points, followed by cleanup of migration-specific scaffolding if needed.

## Execution Guidance

This plan is designed to be executed using the API conversion workflow plus the migration slice
template:

| Phase | Workflow to Use | When to Use It |
| --- | --- | --- |
| Phase 1-3 | `convert-js-api-to-typescript.md` | Converting individual API modules |
| Phase 4 | `complete-web-typescript-migration.md` | Cleanup, consistency pass, and migration artifact review |

Before starting a batch, read the workflow file end-to-end. For each slice, fill out the
`agents/templates/typescript-migration-slice.md` template to document scope, contract sources, and
validation.

---

## Recommended Solution

### Phase 1: Infrastructure And Reachability
**Implementation:**
- Confirm each remaining `web/src/api` JavaScript file is still imported and needed.
- Convert `web/src/api/http-client.js` to TypeScript first, because it is shared infrastructure for
  the rest of the API layer.
- Identify any barrels that should be kept as barrels versus collapsed into direct typed imports.
- Record any backend serializer dependencies exposed by the remaining files before converting them.

**Benefits:**
- Stabilizes the shared transport layer before converting dependent API modules.
- Avoids wasting time on dead barrels or obsolete entry points.
- Makes later conversions more mechanical and less risky.

### Phase 2: Leaf API Module Conversion
**Implementation:**
- Convert the remaining leaf API modules:
  - `flight-reconciliations-api.js`
  - `qa/scenarios-api.js`
  - `travel-authorizations/estimates/generate-api.js`
  - `travel-authorizations/expenses/prefill-api.js`
  - `travel-desk-flight-options/re-order-flight-segments-api.js`
- Follow the existing API workflow for enums, `AsIndex` / `AsShow`, and typed query options.
- Reuse existing backend serializers when they exist, and document backend cleanup dependencies when
  they do not.

**Benefits:**
- Removes the remaining leaf JavaScript API clients from the main contract surface.
- Improves consistency for composables and components that consume those modules.
- Keeps changes small enough to review one module at a time if needed.

### Phase 3: Nested API Barrels And Pre-Approval Submission Helpers
**Implementation:**
- Convert or simplify:
  - `travel-authorization-pre-approval-submissions/index.js`
  - `travel-authorization-pre-approval-submissions/pre-approvals-api.js`
- Prefer deleting or shrinking trivial barrels when direct imports are clearer.
- Ensure any nested API exports remain consistent with the already-migrated top-level pre-approval
  API modules.

**Benefits:**
- Finishes the remaining JavaScript surface inside `web/src/api`.
- Reduces barrel drift and duplicate export paths.
- Leaves the API layer with one consistent TypeScript import story.

### Phase 4: Cleanup And Validation
**Implementation:**
- Search for stale `.js` imports under `web/src` after the conversions land.
- Run targeted frontend validation for the changed API modules:
  - `./bin/dev web npm run check-types`
  - `./bin/dev web npm run lint`
  - targeted web tests when the converted API modules have direct coverage
- Remove migration-only notes or temporary compatibility shims created during the API migration.
- If the API-specific migration workflow/template no longer adds value after completion, review it
  during the broader migration artifact cleanup phase.

**Benefits:**
- Ensures the API layer is consistently typed end to end.
- Catches stale import paths before they spread into follow-up work.
- Prevents temporary migration scaffolding from lingering after the API layer is done.

## Decision Factors

1. Whether `http-client.js` should be converted directly or refactored slightly while being typed.
2. Whether the nested pre-approval submission barrel should remain as a barrel at all.
3. Which remaining leaf modules depend on backend serializer clarification before a safe frontend
   type can be declared.
4. Whether the remaining files should land as one batch or as two smaller reviewable slices.

## Recommended Action

Start with `http-client.js` plus one or two of the simplest leaf API modules so the first slice
proves the contract pattern without mixing too many endpoints. Then finish the remaining leaf API
modules, followed by the nested pre-approval submission barrel cleanup.

Treat this as an API-layer plan only. Do not pull `web/src/use`, `web/src/utils`, or non-API web
files into this plan's execution scope.

## Files To Review

1. `web/src/api/http-client.js` - shared transport layer and base typing surface
2. `web/src/api/flight-reconciliations-api.js` - remaining top-level API client
3. `web/src/api/qa/scenarios-api.js` - remaining nested QA API client
4. `web/src/api/travel-authorizations/estimates/generate-api.js` - nested travel authorization API helper
5. `web/src/api/travel-authorizations/expenses/prefill-api.js` - nested expense helper API module
6. `web/src/api/travel-desk-flight-options/re-order-flight-segments-api.js` - nested flight option helper API module
7. `web/src/api/travel-authorization-pre-approval-submissions/index.js` - nested barrel export
8. `web/src/api/travel-authorization-pre-approval-submissions/pre-approvals-api.js` - nested pre-approval submission API helper
9. `agents/workflows/convert-js-api-to-typescript.md` - conversion workflow and contract rules
10. `agents/templates/typescript-migration-slice.md` - per-slice scoping template

## Out Of Scope

- Converting non-API frontend files such as `web/src/use`, `web/src/utils`, `web/src/controllers`,
  `web/src/config.js`, `web/src/urls.js`, `web/src/locales/en.js`, or `web/tests`.
- Backend serializer or service refactors beyond what is needed to understand the response shape of
  a frontend API module.
- Build-tool config migration (`web/.eslintrc.cjs`, `web/babel.config.js`, `web/vite.config.js`).

## Related Issues

- PR #360: https://github.com/icefoganalytics/travel-authorization/pull/360
