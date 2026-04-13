# Plan: Convert Web Use Composables to TypeScript

## Problem Statement

TravelAuth has 29 JavaScript composable files in `web/src/use` that use JSDoc for typing. These composables are consumed by Vue components and provide reactive state management for API resources. Converting them to TypeScript will provide better type inference, cleaner syntax, and catch errors at compile time rather than runtime. This work is part of the broader Vue 3 migration effort and aligns with issue #100.

## Current State Analysis

**Already Implemented:**
- API layer has been converted to TypeScript (web/src/api/*.ts)
- Composable conversion workflows exist and are documented:
  - `convert-js-singular-composable-to-typescript.md` for single-resource composables
  - `convert-js-plural-composable-to-typescript.md` for list composables
- Frontend API TypeScript template exists for reference
- Many composables already have corresponding TypeScript API files

**Not Yet Implemented:**
- 29 JavaScript composable files remain in `web/src/use`:
  - Singular composables (single resource by ID): 14 files
  - Plural composables (list with query options): 14 files
  - Utility composables (snack): 1 file
- Composables use JSDoc type definitions which are verbose and error-prone
- Some composables may need their corresponding API files converted first

## Key Findings

1. **Composable Categories:**
   - **Singular composables** (fetch one resource by ID): `use-location.js`, `use-per-diem.js`, `use-travel-allowance.js`, `use-travel-authorization-pre-approval-profile.js`, `use-travel-authorization-pre-approval-submission.js`, `use-travel-authorization-pre-approval.js`, `use-travel-desk-flight-option.js`, `use-travel-desk-flight-request.js`, `use-travel-desk-flight-segment.js`, `use-travel-desk-question.js`, `use-travel-desk-travel-agency.js`, `use-yg-employee-group.js`, `use-yg-employee.js`
   - **Plural composables** (fetch lists with query options): `use-locations.js`, `use-per-diems.js`, `use-travel-allowances.js`, `use-travel-authorization-action-logs.js`, `use-travel-authorization-pre-approval-profiles.js`, `use-travel-authorization-pre-approval-submissions.js`, `use-travel-authorization-pre-approvals.js`, `use-travel-desk-flight-options.js`, `use-travel-desk-questions.js`, `use-travel-desk-travel-agencies.js`, `use-travel-purposes.js`, `use-yg-employees.js`, `use-flight-reconciliations.js`, `use-general-ledger-codings.js`
   - **Utility composables** (no API): `use-snack.js`
   - **Nested composables** (in subdirectories): `trav-com/use-accounts-receivable-invoice-details.js`

2. **Dependency Ordering:**
   - API files should already be TypeScript (from previous work)
   - If any API files are still JavaScript, convert them first using `convert-js-api-to-typescript.md`
   - Utility composables (no API) can be converted independently

3. **Conversion Complexity:**
   - Most composables follow standard patterns and can use the documented workflows
   - Some composables have deprecated Object.freeze constants that need special handling
   - Nested composable in `trav-com/` may need special attention

## Execution Guidance

This plan is designed to be executed using the composable conversion workflows:

| Phase | Workflow to Use | When to Use It |
| --- | --- | --- |
| Phase 1-2 | `convert-js-singular-composable-to-typescript.md` | Converting single-resource composables |
| Phase 1-2 | `convert-js-plural-composable-to-typescript.md` | Converting list composables |
| Phase 3 | Manual conversion | Utility composables without API |

Before starting a batch, read the workflow file end-to-end. For each composable, follow the workflow steps exactly as documented.

---

## Recommended Solution

### Phase 1: Prerequisites and Reachability

**Implementation:**
- Verify each composable's corresponding API file is TypeScript
- Identify any composables without corresponding API files (utility composables)
- Check for deprecated constants that need special handling
- Record any custom patterns that deviate from standard workflows

**Benefits:**
- Ensures conversion dependencies are satisfied before starting
- Identifies edge cases that may need manual handling
- Prevents conversion failures due to missing API types

### Phase 2: Convert Plural Composables

**Implementation:**
- Convert the 14 plural composables using `convert-js-plural-composable-to-typescript.md`:
  - `use-locations.js`
  - `use-per-diems.js`
  - `use-travel-allowances.js`
  - `use-travel-authorization-action-logs.js`
  - `use-travel-authorization-pre-approval-profiles.js`
  - `use-travel-authorization-pre-approval-submissions.js`
  - `use-travel-authorization-pre-approvals.js`
  - `use-travel-desk-flight-options.js`
  - `use-travel-desk-questions.js`
  - `use-travel-desk-travel-agencies.js`
  - `use-travel-purposes.js`
  - `use-yg-employees.js`
  - `use-flight-reconciliations.js`
  - `use-general-ledger-codings.js`

- Follow the workflow for each file:
  - Rename from `.js` to `.ts`
  - Remove JSDoc type definitions
  - Add TypeScript parameter and return types
  - Re-export types for consumer convenience
  - Add `skipWatchIf` parameter
  - Update error logging format

**Benefits:**
- Handles the most complex composables first (query options, filters, pagination)
- Standardizes list composable patterns across the codebase
- Provides type safety for the most commonly used composables

### Phase 3: Convert Singular Composables

**Implementation:**
- Convert the 13 singular composables using `convert-js-singular-composable-to-typescript.md`:
  - `use-location.js`
  - `use-per-diem.js`
  - `use-travel-allowance.js`
  - `use-travel-authorization-pre-approval-profile.js`
  - `use-travel-authorization-pre-approval-submission.js`
  - `use-travel-authorization-pre-approval.js`
  - `use-travel-desk-flight-option.js`
  - `use-travel-desk-flight-request.js`
  - `use-travel-desk-flight-segment.js`
  - `use-travel-desk-question.js`
  - `use-travel-desk-travel-agency.js`
  - `use-yg-employee-group.js`
  - `use-yg-employee.js`

- Follow the workflow for each file:
  - Rename from `.js` to `.ts`
  - Remove JSDoc type definitions
  - Add TypeScript parameter types (`Ref<number | null | undefined>`)
  - Add policy to state if API returns policy
  - Add save method if API has update method
  - Re-export types for consumer convenience
  - Update error logging format

**Benefits:**
- Completes the standard composable conversion work
- Provides type safety for single-resource operations
- Standardizes singular composable patterns

### Phase 4: Convert Utility and Nested Composables

**Implementation:**
- Convert utility composables manually:
  - `use-snack.js` (no API, simple utility)
- Convert nested composables:
  - `trav-com/use-accounts-receivable-invoice-details.js`

- For utility composables:
  - Add TypeScript types manually
  - Follow existing patterns from similar utilities
- For nested composables:
  - Consider moving to main `web/src/use/` directory
  - Follow appropriate workflow based on singular/plural nature

**Benefits:**
- Handles edge cases that don't fit standard workflows
- Cleans up nested directory structure
- Completes full TypeScript coverage

### Phase 5: Validation and Cleanup

**Implementation:**
- Run type checking: `./bin/dev web npm run check-types`
- Fix any type errors that emerge
- Search for remaining `.js` imports in components
- Update component imports to use `.ts` extensions where needed
- Run linter: `./bin/dev web npm run lint`
- Run web tests: `./bin/dev test_web`

**Benefits:**
- Ensures the conversion is complete and correct
- Catches any missed imports or type mismatches
- Validates that the application still works correctly

## Decision Factors

1. **Order of conversion:** Plural composables first (more complex), then singular, then utilities
2. **Batch size:** Convert one composable at a time, commit, then continue (following established pattern)
3. **API dependencies:** Ensure API files are TypeScript before converting corresponding composables
4. **Deprecated constants:** Only re-export if they existed in the original JavaScript file
5. **Nested directory:** Consider flattening `trav-com/` structure or keep as-is based on usage

## Recommended Action

Start with Phase 1 (prerequisites) to identify any API files that need conversion. Then proceed to Phase 2 (plural composables) using the documented workflow. Convert one composable at a time, commit, and continue. This incremental approach allows for review and rollback if issues arise.

Treat this as a composable-layer plan only. Do not pull component files or other frontend files into this plan's execution scope.

## Files To Review

### Plural Composables (14 files)
1. `web/src/use/use-locations.js`
2. `web/src/use/use-per-diems.js`
3. `web/src/use/use-travel-allowances.js`
4. `web/src/use/use-travel-authorization-action-logs.js`
5. `web/src/use/use-travel-authorization-pre-approval-profiles.js`
6. `web/src/use/use-travel-authorization-pre-approval-submissions.js`
7. `web/src/use/use-travel-authorization-pre-approvals.js`
8. `web/src/use/use-travel-desk-flight-options.js`
9. `web/src/use/use-travel-desk-questions.js`
10. `web/src/use/use-travel-desk-travel-agencies.js`
11. `web/src/use/use-travel-purposes.js`
12. `web/src/use/use-yg-employees.js`
13. `web/src/use/use-flight-reconciliations.js`
14. `web/src/use/use-general-ledger-codings.js`

### Singular Composables (13 files)
1. `web/src/use/use-location.js`
2. `web/src/use/use-per-diem.js`
3. `web/src/use/use-travel-allowance.js`
4. `web/src/use/use-travel-authorization-pre-approval-profile.js`
5. `web/src/use/use-travel-authorization-pre-approval-submission.js`
6. `web/src/use/use-travel-authorization-pre-approval.js`
7. `web/src/use/use-travel-desk-flight-option.js`
8. `web/src/use/use-travel-desk-flight-request.js`
9. `web/src/use/use-travel-desk-flight-segment.js`
10. `web/src/use/use-travel-desk-question.js`
11. `web/src/use/use-travel-desk-travel-agency.js`
12. `web/src/use/use-yg-employee-group.js`
13. `web/src/use/use-yg-employee.js`

### Utility and Nested Composables (2 files)
1. `web/src/use/use-snack.js`
2. `web/src/use/trav-com/use-accounts-receivable-invoice-details.js`

### Workflows and Templates
1. `agents/workflows/convert-js-singular-composable-to-typescript.md` - Singular composable conversion
2. `agents/workflows/convert-js-plural-composable-to-typescript.md` - Plural composable conversion
3. `agents/workflows/convert-js-api-to-typescript.md` - API conversion (if needed)
4. `agents/templates/frontend-api-typescript-template.md` - Reference for API patterns

## Out Of Scope

- Converting Vue components
- Converting other frontend files (web/src/utils, web/src/config, etc.)
- Backend serializer or service refactors
- Build-tool config migration

## Related Issues

- Issue #100: https://github.com/icefoganalytics/travel-authorization/issues/100
