---
description: Workflow for moving a batch of remaining web JavaScript files to TypeScript while keeping contracts, imports, and validation aligned across the stack.
auto_execution_mode: 1
---

# Complete Web TypeScript Migration Workflow

## Intent

**WHY this workflow exists:** The remaining JavaScript files are no longer isolated to one layer.
Utility helpers, API clients, composables, tests, and a few config files all interact, so a
one-file-at-a-time migration can create mismatched contracts and repeated cleanup work.

**WHAT this workflow produces:** A migration slice that:
- converts a coherent batch of remaining JavaScript files to TypeScript
- updates imports and barrels without leaving mixed JS/TS duplicates behind
- aligns frontend API contracts with backend serializers when needed
- verifies the slice with focused type-checking, linting, and tests

**Decision Rules:**
- Migrate by dependency direction: shared helpers first, then API clients, then composables and app
  wiring, then tests/tooling.
- Delete orphaned legacy files instead of converting them.
- If a frontend API migration reveals a missing backend serializer or type shape, fix that contract
  in the same slice.
- Do not force config files into TypeScript unless the toolchain clearly supports it and the
  conversion reduces maintenance.

## When To Use This Workflow

Use this workflow when the task is bigger than a single API or composable conversion and needs a
repeatable batch process, such as:
- "Convert the remaining `web/src/api` files to TypeScript."
- "Finish the rest of the JavaScript helpers under `web/src/utils`."
- "Ship the next TypeScript migration slice from the migration plan."

**Prerequisite:** Before using this workflow, read `agents/plans/Plan, Web TypeScript Migration Completion, 2026-04-13.md` to understand the overall migration phases and current state.

For single-file or single-pattern work, prefer the narrower workflows:
- `convert-js-api-to-typescript.md`
- `convert-js-singular-composable-to-typescript.md`
- `convert-js-plural-composable-to-typescript.md`

## Inputs

- The migration plan in `agents/plans/Plan, Web TypeScript Migration Completion, 2026-04-13.md`
- A defined slice of files or one plan phase
- Current branch diff against `origin/main`
- The template in `agents/templates/typescript-migration-slice.md`

## Workflow

### 1. Reconcile The Plan With The Branch

- Compare the plan's assumptions with `git diff --name-status origin/main...HEAD`.
- Identify which plan phase is already partially complete on the branch.
- Update the working slice so you do not repeat already-landed conversions.
- Record the batch in the migration slice template before editing files.

### 2. Confirm Reachability And Scope

- List the remaining `.js` files in the target subtree.
- Verify each file is still reachable from routes, pages, barrels, or imports.
- Mark each file as one of:
  - convert directly
  - merge into an existing TypeScript module
  - delete as orphaned
  - defer because it is a config/tooling exception

### 3. Establish The Canonical Type Source

- For API-driven files, inspect the backend model and serializer first.
- Prefer API modules as the canonical source for frontend-exported types.
- If a serializer is missing or still uses legacy naming, add the minimal backend cleanup needed to
  make the TypeScript contract explicit.

### 4. Convert The Batch

- Rename each in-scope file from `.js` to `.ts`.
- Remove JSDoc type scaffolding and replace it with direct TypeScript types.
- Update imports to match repo conventions and remove `.js` suffixes.
- Re-export types from API modules and composables where the project already expects that pattern.
- Delete duplicate JS barrels or compatibility shims once consumers are updated.

### 5. Validate Integration Points

- Search for old `.js` imports and stale path references after the rename.
- Check whether route registration, controller wiring, or test helpers still point at deleted files.
- For frontend API migrations, confirm the returned `AsIndex`/`AsShow` shapes still match backend
  responses.

### 6. Verify The Slice

- Run the smallest meaningful verification for the changed area first.
- Typical commands:
  - `./bin/dev web npm run check-types`
  - `./bin/dev web npm run lint`
  - `./bin/dev web npm test -- --run <targeted-tests>`
- If backend serializer work was touched, also run the smallest meaningful API verification.

### 7. Close The Slice Cleanly

- Update the migration plan if the batch materially changed what remains.
- Summarize what moved, what was deleted, and what is intentionally deferred.
- Keep the next slice obvious for the following PR or agent pass.
- If the migration is complete, remove temporary migration-only workflows, plans, and templates, or
  replace the template with a durable "good web API pattern" template.

## Output Checklist

- [ ] No converted file is left with a stale `.js` import path
- [ ] No duplicate JS and TS source pair remains without a reason
- [ ] API modules export the types their consumers need
- [ ] Backend serializer naming matches frontend `AsIndex` / `AsShow` expectations where relevant
- [ ] Reachability was checked before migrating legacy frontend files
- [ ] Type-checking, linting, and targeted tests were run or explicitly deferred

## Recommended Companion Files

- `agents/plans/Plan, Web TypeScript Migration Completion, 2026-04-13.md`
- `agents/templates/typescript-migration-slice.md`
- `agents/workflows/convert-js-api-to-typescript.md`
- `agents/workflows/convert-js-singular-composable-to-typescript.md`
- `agents/workflows/convert-js-plural-composable-to-typescript.md`
