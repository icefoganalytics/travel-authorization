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
- Backend serializer templates exist for creating IndexSerializer and ShowSerializer

**Not Yet Implemented:**
- 29 JavaScript composable files remain in `web/src/use`:
  - Singular composables (single resource by ID): 14 files
  - Plural composables (list with query options): 14 files
  - Utility composables (snack): 1 file
- Composables use JSDoc type definitions which are verbose and error-prone
- Some API files may not have proper AsIndex types for list methods or AsShow types for get/update methods
- Some backend controllers may not use IndexSerializer for list responses or ShowSerializer for detail responses
- Sibling projects (wrap, elcc-data-management, traditional-knowledge) consistently use ShowSerializer + AsShow for singular endpoints, but travel-auth has gaps

## Key Findings

1. **Composable Categories:**
   - **Singular composables** (fetch one resource by ID): `use-location.js`, `use-per-diem.js`, `use-travel-allowance.js`, `use-travel-authorization-pre-approval-profile.js`, `use-travel-authorization-pre-approval-submission.js`, `use-travel-authorization-pre-approval.js`, `use-travel-desk-flight-option.js`, `use-travel-desk-flight-request.js`, `use-travel-desk-flight-segment.js`, `use-travel-desk-question.js`, `use-travel-desk-travel-agency.js`, `use-yg-employee-group.js`, `use-yg-employee.js`
   - **Plural composables** (fetch lists with query options): `use-locations.js`, `use-per-diems.js`, `use-travel-allowances.js`, `use-travel-authorization-action-logs.js`, `use-travel-authorization-pre-approval-profiles.js`, `use-travel-authorization-pre-approval-submissions.js`, `use-travel-authorization-pre-approvals.js`, `use-travel-desk-flight-options.js`, `use-travel-desk-questions.js`, `use-travel-desk-travel-agencies.js`, `use-travel-purposes.js`, `use-yg-employees.js`, `use-flight-reconciliations.js`, `use-general-ledger-codings.js`
   - **Utility composables** (no API): `use-snack.js`
   - **Nested composables** (in subdirectories): `trav-com/use-accounts-receivable-invoice-details.js`

2. **Dependency Ordering:**
   - API files should already be TypeScript (from previous work)
   - Backend serializers must exist:
     - IndexSerializer for list endpoints (plural composables)
     - ShowSerializer for detail endpoints (singular composables)
   - API files must use AsIndex types for list methods and AsShow types for get/update methods
   - Controllers must use IndexSerializer for index responses and ShowSerializer for show/update responses
   - If any API files are still JavaScript, convert them first using `convert-js-api-to-typescript.md`
   - Utility composables (no API) can be converted independently

3. **Conversion Complexity:**
   - Most composables follow standard patterns and can use the documented workflows
   - Some composables have deprecated Object.freeze constants that need special handling
   - Nested composable in `trav-com/` may need special attention

## Execution Guidance

This plan is designed to be executed using the composable conversion workflows:

| Phase | Workflow/Template to Use | When to Use It |
| --- | --- | --- |
| Phase 0 | `agents/templates/backend-index-serializer-template.md` | Creating backend IndexSerializer for list endpoints |
| Phase 0.5 | `agents/templates/backend-show-serializer-template.md` | Creating backend ShowSerializer for detail endpoints |
| Phase 1 | Manual verification | Checking prerequisites across all resources before conversion |
| Phase 2 | `convert-js-plural-composable-to-typescript.md` | Converting list composables |
| Phase 3 | `convert-js-singular-composable-to-typescript.md` | Converting single-resource composables |
| Phase 4 | Manual conversion | Utility composables without API |
| Phase 5 | `check-types`, `lint`, `test` commands | Validation and cleanup |

Before starting a batch, read the workflow file end-to-end. For each composable, follow the workflow steps exactly as documented.

---

## Recommended Solution

### Phase 0: Backend Serialization Prerequisites

**Implementation:**
- For each resource with a plural composable, check if backend has IndexSerializer
- If missing, create IndexSerializer using `agents/templates/backend-index-serializer-template.md`
- Update controller to use IndexSerializer in index method
- Update API file to use AsIndex type for list method
- Update serializer index to export IndexSerializer

**Benefits:**
- Ensures proper type alignment between backend and frontend
- Prevents composables from using incorrect types
- Establishes the serializer pattern for future work

### Phase 0.5: Backend ShowSerialization Prerequisites

**Implementation:**
- For each resource with a singular composable, check if backend has ShowSerializer
- If missing, create ShowSerializer using `agents/templates/backend-show-serializer-template.md`
- Update controller to use ShowSerializer in show() (and update() if applicable)
- Update API file to use AsShow type for get/update methods
- Update serializer index to export ShowSerializer and AsShow type

**Benefits:**
- Ensures proper type alignment between backend and frontend for detail views
- Prevents composables from using raw model types that may include unintended fields
- Aligns with the consistent pattern used by sibling projects (wrap, elcc-data-management, traditional-knowledge)

### Phase 1: Prerequisites and Reachability

**Implementation:**
- Verify each composable's corresponding API file is TypeScript
- Verify API file uses AsIndex type for list methods and AsShow type for get/update methods
- Verify backend controller uses IndexSerializer for list responses and ShowSerializer for detail responses
- Identify any composables without corresponding API files (utility composables)
- Check for deprecated constants that need special handling
- Record any custom patterns that deviate from standard workflows

**Benefits:**
- Ensures conversion dependencies are satisfied before starting
- Identifies edge cases that may need manual handling
- Prevents conversion failures due to missing API types

### Phase 2: Convert Plural Composables

**Implementation:**
- Convert the 13 remaining plural composables using `convert-js-plural-composable-to-typescript.md`:
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

- Note: `use-locations.js` already converted with backend serialization work

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

1. **Order of conversion:** Backend serialization first (Phase 0: IndexSerialization, Phase 0.5: ShowSerialization), then prerequisites verification (Phase 1), then plural composables (Phase 2), then singular composables (Phase 3), then utilities (Phase 4), then validation (Phase 5)
2. **Batch size:** Convert one composable at a time, commit, then continue (following established pattern)
3. **Backend serialization:** Create IndexSerializer before converting plural composables and ShowSerializer before converting singular composables if missing
4. **API type alignment:** Ensure API uses AsIndex types for list methods before plural composable conversion, and AsShow types for get/update before singular composable conversion
5. **Deprecated constants:** Only re-export if they existed in the original JavaScript file
6. **Nested directory:** Consider flattening `trav-com/` structure or keep as-is based on usage

## Recommended Action

Start with Phase 0 (IndexSerialization) to ensure each resource has proper IndexSerializer and API type alignment for list endpoints. Then proceed to Phase 0.5 (ShowSerialization) to ensure each resource has proper ShowSerializer and API type alignment for detail endpoints. Then Phase 1 (prerequisites) to verify API types across both paths. Then Phase 2 (plural composables) followed by Phase 3 (singular composables), one at a time. This incremental approach allows for review and rollback if issues arise.

Treat this as a composable-layer plan with necessary backend serialization prerequisites. Do not pull component files or other frontend files into this plan's execution scope.

## Files To Review

### Plural Composables (13 remaining)
1. `web/src/use/use-locations.js` - COMPLETED with backend serialization
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
1. `agents/workflows/convert-js-singular-composable-to-typescript-workflow.md` - Singular composable conversion
2. `agents/workflows/convert-js-plural-composable-to-typescript-workflow.md` - Plural composable conversion
3. `agents/workflows/convert-js-api-to-typescript-workflow.md` - API conversion (if needed)
4. `agents/templates/frontend-api-typescript-template.md` - Reference for API patterns
5. `agents/templates/backend-index-serializer-template.md` - Backend IndexSerializer template
6. `agents/templates/backend-show-serializer-template.md` - Backend ShowSerializer template
7. `agents/templates/backend-serializer-index-template.md` - Backend serializer index template

## Out Of Scope

- Converting Vue components
- Converting other frontend files (web/src/utils, web/src/config, etc.)
- Build-tool config migration

## Related Issues

- Issue #100: https://github.com/icefoganalytics/travel-authorization/issues/100

## Learnings from First Conversion (use-locations)

**What happened:**
- Started converting use-locations.js to TypeScript
- Discovered API was returning `Location[]` instead of `LocationAsIndex[]`
- Had to create backend IndexSerializer for locations
- Updated controller to use IndexSerializer in index method
- Updated frontend API to use LocationAsIndex type
- Then converted composable to TypeScript

**Key insights:**
1. Backend serialization is a prerequisite for composable conversion - cannot be treated as out of scope
2. API files must use AsIndex types for list methods, not base model types
3. Controllers must use IndexSerializer for list responses to ensure type alignment
4. One-at-a-time conversion revealed dependencies that would be missed in batch conversion
5. The plan must include backend serialization work as Phase 0 (prerequisites)
6. This pattern will likely repeat for other plural composables
7. When converting composables with deprecated constants, export both deprecated and non-deprecated versions for backward compatibility

**Staged changes for use-locations:**
- Created `api/src/serializers/locations/index-serializer.ts`
- Updated `api/src/serializers/locations/index.ts` to export IndexSerializer
- Updated `api/src/controllers/locations-controller.ts` to use IndexSerializer
- Updated `web/src/api/locations-api.ts` to use LocationAsIndex type
- Converted `web/src/use/use-locations.js` to TypeScript

**Plan updates made:**
- Added Phase 0 for backend IndexSerialization prerequisites
- Added Phase 0.5 for backend ShowSerialization prerequisites
- Updated Phase 1 to verify API type alignment for both AsIndex and AsShow
- Removed backend work from Out of Scope
- Updated decision factors to include both serializer types
- Added and updated backend serializer templates in workflows section
- Marked use-locations.js as completed
