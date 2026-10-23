---
description: TravelAuth-specific requirements for JavaScript-to-TypeScript migration slices
---

# TypeScript Migration Slice Workflow

Use the shared [TypeScript Migration Slice Workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/typescript-migration-slice-workflow.md) as the authoritative process and slice template. Add these TravelAuth-specific fields and checks to the shared template:

## Plan Alignment

- Plan phase: `[Phase number and name]`
- Branch state checked against: `git diff --name-status origin/main...HEAD`
- Why this slice now:

## Backend Contract Sources

- Backend model:
- Backend serializer:
- Existing TypeScript reference files:

## TravelAuth Migration Notes

- Shared types to export:
- Imports or barrels to update:
- Runtime edge cases to preserve:
- Expected backend cleanup, if any:

## Local Validation

- Type-check:
- Lint:
- Targeted tests:

Confirm serializer-aligned frontend types and exports match the backend contract. Use the canonical [test commands in `bin/README.md`](../../bin/README.md#testing) for local verification.
