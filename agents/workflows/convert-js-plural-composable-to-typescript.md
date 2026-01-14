---
description: Workflow for converting plural use JavaScript composable files (use-resources.ts) to TypeScript with proper typing and reactive state.
auto_execution_mode: 1
---

# Convert JavaScript Plural Composable to TypeScript Workflow

> **Purpose:** Convert a plural use JavaScript composable file to TypeScript following project conventions.
>
> **Scope:** Frontend composable conversion (plural form: `useResources`, not singular `useResource`)
>
> **Reference Files:** `use-travel-authorizations.ts`, `use-expenses.ts`, `use-travel-segments.ts`, `use-per-diem-claims.ts`

## Prerequisites

Before starting, ensure:

- [ ] The JavaScript composable file exists in `web/src/use/`
- [ ] The corresponding TypeScript API file exists (e.g., `web/src/api/resources-api.ts`)
- [ ] You understand the API methods available (list, create, custom actions)

---

## Conversion Steps

### 1. Update File Extension

Rename `.js` to `.ts`:

```bash
git mv web/src/use/use-{resources}.js web/src/use/use-{resources}.ts
```

---

### 2. Update Imports

**Before (JS):**

```javascript
import { reactive, toRefs, unref, watch, computed } from "vue"
import { isNil } from "lodash"

import resourcesApi from "@/api/resources-api"
```

**After (TS):**

```typescript
import { reactive, toRefs, unref, watch, ref } from "vue"
import { isNil } from "lodash"

import resourcesApi, {
  type ResourceAsIndex,
  type ResourceWhereOptions,
  type ResourceFiltersOptions,
  type ResourceQueryOptions,
  ResourceStatuses,
  ResourceTypes,
  // Only include deprecated constants if they were in the original JS file
  STATUSES,
  TYPES,
} from "@/api/resources-api"
```

**Import style:** Use named imports for API modules: `import { apiName } from "@/path/to/api"`. Exception: when importing many APIs in the same file, use top-level import with dot lookups: `import api from "@/api"`

**Import guidance:**
- Import Vue composables that are actually used (reactive, toRefs, unref, watch, ref)
- Import the appropriate type from the API file (`ResourceAsIndex`, not `ResourceAsShow`)
- Import all common types: `WhereOptions`, `FiltersOptions`, `QueryOptions`
- Import any enums/constants used by the resource
- Only import deprecated constants if they were in the original JavaScript file
- Don't import `type Ref` - use `ref<>()` which infers the type automatically
- Keep imports minimal - only import what's re-exported or used

---

### 3. Remove JSDoc Type Definitions

**Before (JS):**

```javascript
/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/resources-api.js').Resource} Resource */

/**
 * @callback UseResources
 * @param {Ref<Object>} options
 * @returns {{
 *   resources: Ref<Resource[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<Resource[]>,
 *   refresh: () => Promise<Resource[]>,
 * }}
 */

/** @type {UseResources} */
export function useResources(options) {
```

**After (TS):**

```typescript
export function useResources(
  options = ref<ResourceQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
): {
  resources: ResourceAsIndex[]
  totalCount: number
  isLoading: boolean
  isErrored: boolean
  fetch: () => Promise<ResourceAsIndex[]>
  refresh: () => Promise<ResourceAsIndex[]>
} {
```

**Key Changes:**

- Remove all JSDoc type definitions (`@template`, `@typedef`, `@callback`, `@type`)
- Add TypeScript parameter types directly to function signature
- Parameter uses `ref<ResourceQueryOptions>({})` which infers `Ref` type automatically
- Add optional `skipWatchIf` parameter for conditional watching

---

### 4. Re-export Types for Convenience

Add type re-exports after imports for consumer convenience:

```typescript
import resourcesApi, {
  type ResourceAsIndex,
  type ResourceWhereOptions,
  type ResourceFiltersOptions,
  type ResourceQueryOptions,
  ResourceStatuses,
  ResourceTypes,
  // Only include deprecated constants if they were in the original JS file
  STATUSES,
  TYPES,
} from "@/api/resources-api"

export {
  type ResourceAsIndex,
  type ResourceWhereOptions,
  type ResourceFiltersOptions,
  type ResourceQueryOptions,
  ResourceStatuses,
  ResourceTypes,
  // Only export deprecated constants if they were in the original JS file
  STATUSES,
  TYPES,
}
```

**Pattern:** Always export all common types (`WhereOptions`, `FiltersOptions`, `QueryOptions`) plus any enums/constants used by the resource. **Only export deprecated constants if they were in the original JavaScript file** to maintain backward compatibility.

---

### 5. Add Typed Reactive State

**Before (JS):**

```javascript
const state = reactive({
  resources: [],
  totalCount: 0,
  isLoading: false,
  isErrored: false,
})
```

**After (TS):**

```typescript
const state = reactive<{
  resources: ResourceAsIndex[]
  totalCount: number
  isLoading: boolean
  isErrored: boolean
}>({
  resources: [],
  totalCount: 0,
  isLoading: false,
  isErrored: false,
})
```

**State Properties:**
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `resources` | `ResourceAsIndex[]` | `[]` | Array of resources |
| `totalCount` | `number` | `0` | Total count for pagination |
| `isLoading` | `boolean` | `false` | Loading state |
| `isErrored` | `boolean` | `false` | Error state |
| `isInitialized` | `boolean` | `false` | Optional, for complex flows |

---

### 6. Add Return Types to Functions

**Before (JS):**

```javascript
async function fetch() {
  // ...
  return resources
}
```

**After (TS):**

```typescript
async function fetch(): Promise<ResourceAsIndex[]> {
  // ...
  return state.resources
}
```

**Common Function Return Types:**

- `fetch()`: `Promise<ResourceAsIndex[]>`
- `refresh()`: `Promise<ResourceAsIndex[]>`

---

### 7. Update Error Logging Format

**Before (JS):**

```javascript
console.error("Failed to fetch resources:", error)
```

**After (TS):**

```typescript
console.error(`Failed to fetch resources: ${error}`, { error })
```

**Pattern:** Use template literal with error object for better debugging.

---

### 8. Update Watch Configuration

**Before (JS):**

```javascript
watch(
  () => unref(options),
  async () => {
    await fetch()
  },
  {
    deep: true,
    immediate: true,
  }
)
```

**After (TS):**

```typescript
watch(
  () => [skipWatchIf(), unref(options)],
  async ([skip]) => {
    if (skip) return

    await fetch()
  },
  { deep: true, immediate: true }
)
```

**Key Changes:**

- Use array watch pattern to watch both skip condition and options together
- Always include `skipWatchIf` parameter for conditional watching
- Maintain `deep: true` for object changes
- Keep `immediate: true` for initial fetch

---

### 9. Add Typed Computed Properties (Optional/Exception)

**Note:** Computed properties should be rare exceptions, not common patterns. Only add them when you have specific derived state needs that can't be handled by direct access.

If the composable needs derived state, add explicit type annotations:

**Before (JS):**

```javascript
const earliestDate = computed(() => {
  if (state.resources.length > 0) {
    return state.resources[0].date
  }
  return null
})
```

**After (TS):**

```typescript
const earliestDate = computed<string | null>(() => {
  if (isEmpty(state.resources)) return null

  return state.resources[0].date
})
```

**Note:** Prefer `isEmpty()` from lodash over manual `length === 0` checks for better null/undefined handling.

**Example Computed Properties (use only as-needed):**

```typescript
const isEmpty = computed(() => isEmpty(state.resources))
const hasResults = computed(() => !isEmpty(state.resources))
```

---

## Complete Example

**Input:** `use-expenses.js`

```javascript
import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import expensesApi from "@/api/expenses-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/expenses-api.js').Expense} Expense */

/**
 * @callback UseExpenses
 * @param {Ref<Object>} options
 * @returns {{
 *   expenses: Ref<Expense[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<Expense[]>,
 *   refresh: () => Promise<Expense[]>,
 * }}
 */

/** @type {UseExpenses} */
export function useExpenses(options) {
  const state = reactive({
    expenses: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { expenses, totalCount } = await expensesApi.list(unref(options))
      state.isErrored = false
      state.expenses = expenses
      state.totalCount = totalCount
      return expenses
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(options),
    async () => {
      await fetch()
    },
    {
      deep: true,
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useExpenses
```

**Output:** `use-expenses.ts`

```typescript
import { reactive, toRefs, unref, watch, ref } from "vue"
import { isNil } from "lodash"

import expensesApi, {
  type ExpenseAsIndex,
  type ExpenseWhereOptions,
  type ExpenseFiltersOptions,
  type ExpenseQueryOptions,
  TYPES,
  EXPENSE_TYPES,
  ExpenseTypes,
  ExpenseExpenseTypes,
} from "@/api/expenses-api"

export {
  type ExpenseAsIndex,
  type ExpenseWhereOptions,
  type ExpenseFiltersOptions,
  type ExpenseQueryOptions,
  TYPES,
  EXPENSE_TYPES,
  ExpenseTypes,
  ExpenseExpenseTypes,
}

export function useExpenses(
  options = ref<ExpenseQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    expenses: ExpenseAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    expenses: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<ExpenseAsIndex[]> {
    state.isLoading = true
    try {
      const { expenses, totalCount } = await expensesApi.list(unref(options))
      state.isErrored = false
      state.expenses = expenses
      state.totalCount = totalCount
      return expenses
    } catch (error) {
      console.error(`Failed to fetch expenses: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [skipWatchIf(), unref(options)],
    async ([skip]) => {
      if (skip) return
      await fetch()
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useExpenses
```

---

## Checklist

- [ ] File renamed from `.js` to `.ts`
- [ ] Imports updated with Vue composables and API types
- [ ] JSDoc type definitions removed
- [ ] Types re-exported for convenience
- [ ] Reactive state properly typed with array types
- [ ] Function return types added
- [ ] Error logging format updated
- [ ] Watch configuration includes `skipWatchIf`
- [ ] Computed properties added if needed
- [ ] TypeScript compiles without errors

---

## Common Patterns

### Default options parameter

```typescript
export function useResources(
  options = ref<ResourceQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
```

---

## Common Pitfalls

1. **Unnecessary `type Ref` imports** - TypeScript infers `Ref` type automatically from parameter declarations
2. **Using `.js` extension in imports** - Remove file extensions
3. **Wrong array type** - Use `ResourceAsIndex[]`, not `ResourceAsIndex | null`
4. **Missing `skipWatchIf` parameter** - Important for conditional watching
5. **Forgetting to re-export types** - Consumers expect types from composable
6. **Not updating error message format** - Use template literal with error object
7. **Using `ResourceAsShow` instead of `ResourceAsIndex`** - Use index types for lists
8. **Missing `deep: true` in watch** - Required for object option changes

---

## Related Workflows

- [convert-js-api-to-typescript.md](convert-js-api-to-typescript.md) - Convert API file first if needed
- [convert-js-singular-composable-to-typescript.md](convert-js-singular-composable-to-typescript.md) - For single resource composables

---

**Workflow Version:** 1.0
**Last Updated:** 2026-01-08
**Reference Files:** `use-travel-authorizations.ts`, `use-expenses.ts`, `use-travel-segments.ts`, `use-travel-desk-flight-requests.ts`

---

## Reference Commits (Git History)

These patterns were extracted from actual conversion commits:

| Commit     | File                                 | Key Patterns                                                                       |
| ---------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| `0d523407` | `use-travel-segments.ts`             | Typed options with `ref<QueryOptions>({})`, `isInitialized` state, enum re-exports |
| `82dfc15a` | `use-travel-desk-flight-requests.ts` | Explicit function return type, `ComputedRef<T>` typing, enum re-exports            |
| `b9c61143` | `use-travel-authorizations.ts`       | Array watch pattern `[skipWatchIf(), unref(options)]`, enum on return object       |

**View a commit:**

```bash
git show <commit-hash>
```
