# TypeScript Migration Slice Template

Use this template to scope and execute one batch of the remaining JavaScript-to-TypeScript
migration work.

## Slice Name

`[Short batch name]`

## Plan Alignment

- Plan phase: `[Phase number and name]`
- Branch state checked against: `git diff --name-status origin/main...HEAD`
- Why this slice now:

## In-Scope Files

- `path/to/file.js` -> `path/to/file.ts`

## Files To Delete Or Merge Instead Of Convert

- `path/to/file.js` - `[why it should be deleted or folded into another module]`

## Contract Sources

- Backend model:
- Backend serializer:
- Existing TypeScript reference files:

## Migration Notes

- Shared types to export:
- Imports or barrels to update:
- Runtime edge cases to preserve:
- Expected backend cleanup, if any:

## Validation Plan

- Type-check:
- Lint:
- Targeted tests:

## Done Criteria

- [ ] All in-scope files converted, merged, or deleted
- [ ] No stale `.js` imports remain for this slice
- [ ] Type exports line up with consumers
- [ ] Validation complete or explicitly deferred

## Follow-Up Candidates

- `next/path.js`
- `another/next/file.js`
