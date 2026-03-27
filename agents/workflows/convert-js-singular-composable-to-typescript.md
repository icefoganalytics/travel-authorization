---
description: Workflow for converting singular use JavaScript composable files (use-resource.ts) to TypeScript with proper typing and reactive state.
auto_execution_mode: 1
---

# Convert JavaScript Singular Composable to TypeScript Workflow

## Intent

**WHY this workflow exists:** JavaScript composables use JSDoc for typing which is verbose and error-prone. TypeScript provides better type inference, cleaner syntax, and catches errors at compile time rather than runtime.

**WHAT this workflow produces:** A TypeScript composable that:

- Fetches a single resource by ID
- Manages loading/error state reactively
- Optionally saves updates back to the API
- Re-exports types for consumer convenience (so components don't need to import from both the composable and the API)

**Decision Rules:**

- **Singular vs Plural:** This workflow is for composables that work with ONE resource by ID (`useUser`, `useExpense`). For composables that fetch lists, use the plural workflow instead.
- **Policy in state:** If the API's `get()` method returns a policy, add `policy` to state. Check the API file.
- **Save method:** Only add `save()` if the API has an `update()` method and you need to modify the resource.

## Reference Files

`use-user.ts`, `use-expense.ts`, `use-travel-purpose.ts`, `use-travel-desk-travel-request.ts`

## Prerequisites

Before starting, ensure:

- [ ] The JavaScript composable file exists in `web/src/use/`
- [ ] The corresponding TypeScript API file exists (e.g., `web/src/api/resources-api.ts`)
- [ ] You understand the API methods available (get, update, custom actions)

---

## Conversion Steps

### 1. Update File Extension

Rename `.js` to `.ts`:

```bash
git mv web/src/use/use-{resource}.js web/src/use/use-{resource}.ts
```

---

### 2. Update Imports

**Before (JS):**

```javascript
import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import resourcesApi from "@/api/resources-api"
```

**After (TS):**

```typescript
import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import resourcesApi, { type ResourceAsShow, type ResourcePolicy } from "@/api/resources-api"
```

**Import Selection:**

- Always import `type Ref` from Vue
- Import specific policy type from API file if API returns policy (`type ResourcePolicy`)
- Import the appropriate types from the API file (`ResourceAsShow`, `ResourcePolicy`, etc.)
- Note: API files should define `export type ResourcePolicy = Policy` for consistency

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
 * @callback UseResource
 * @param {Ref<number>} resourceId
 * @returns {{
 *   resource: Ref<Resource | null | undefined>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<Resource>,
 *   refresh: () => Promise<Resource>,
 * }}
 */

/** @type {UseResource} */
export function useResource(resourceId) {
```

**After (TS):**

```typescript
export function useResource(
  resourceId: Ref<number | null | undefined>
) {
```

**Key Changes:**

- Remove all JSDoc type definitions (`@template`, `@typedef`, `@callback`, `@type`)
- Add TypeScript parameter type directly to function signature
- Parameter type is always `Ref<number | null | undefined>` for ID parameters
- Use descriptive parameter names: `resourceId`, `expenseId`, `travelDeskHotelId` instead of generic `id`

---

### 4. Re-export Types for Convenience

Add type re-exports after imports for consumer convenience:

```typescript
import resourcesApi, { type ResourceAsShow, type ResourcePolicy } from "@/api/resources-api"

export { type ResourceAsShow, type ResourcePolicy }
```

If the composable uses enums or constants, re-export those too:

```typescript
import resourcesApi, {
  RESOURCE_STATUSES,
  type ResourceAsShow,
  type ResourcePolicy,
  type ResourceStatuses,
} from "@/api/resources-api"

export { RESOURCE_STATUSES, type ResourceAsShow, type ResourcePolicy, type ResourceStatuses }
```

---

### 5. Add Typed Reactive State

**Before (JS):**

```javascript
const state = reactive({
  resource: null,
  isLoading: false,
  isErrored: false,
})
```

**After (TS):**

```typescript
const state = reactive<{
  resource: ResourceAsShow | null
  policy: Policy | null
  isLoading: boolean
  isErrored: boolean
}>({
  resource: null,
  policy: null,
  isLoading: false,
  isErrored: false,
})
```

**State Properties:**
| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `{resource}` | `ResourceAsShow \| null` | `null` | Main data object |
| `policy` | `ResourcePolicy \| null` | `null` | Only if API returns policy |
| `isLoading` | `boolean` | `false` | Loading state |
| `isErrored` | `boolean` | `false` | Error state |
| `isInitialized` | `boolean` | `false` | Optional, for complex flows |

---

### 6. Add Return Types to Functions

**Before (JS):**

```javascript
async function fetch() {
  // ...
  return resource
}
```

**After (TS):**

```typescript
async function fetch(): Promise<ResourceAsShow> {
  // ...
  return resource
}
```

**Common Function Return Types:**

- `fetch()`: `Promise<ResourceAsShow>`
- `save()`: `Promise<ResourceAsShow>`
- Custom actions: `Promise<ResourceAsShow>`

---

### 7. Update Error Logging Format

**Before (JS):**

```javascript
console.error("Failed to fetch resource:", error)
```

**After (TS):**

```typescript
console.error(`Failed to fetch resource: ${error}`, { error })
```

**Pattern:** Use template literal with error object for better debugging.

---

### 8. Update Null Checks for Save Methods

**Before (JS):**

```javascript
async function save() {
  // ...
  const { resource } = await resourcesApi.update(staticResourceId, state.resource)
```

**After (TS):**

```typescript
async function save(): Promise<ResourceAsShow> {
  const staticResourceId = unref(resourceId)
  if (isNil(staticResourceId)) {
    throw new Error("resourceId is required")
  }

  if (isNil(state.resource)) {
    throw new Error("No resource to save")
  }

  state.isLoading = true
  try {
    const { resource, policy } = await resourcesApi.update(staticResourceId, state.resource)

    state.isErrored = false
    state.resource = resource
    state.policy = policy

    return resource
  } catch (error) {
    console.error(`Failed to save resource: ${error}`, { error })

    state.isErrored = true

    throw error
  } finally {
    state.isLoading = false
  }
}
```

---

## Complete Example

**Input:** `use-per-diem.js`

```javascript
import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import perDiemsApi from "@/api/per-diems-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/per-diems-api.js').PerDiem} PerDiem */

/**
 * @callback UsePerDiem
 * @param {Ref<number>} perDiemId
 * @returns {{
 *   perDiem: Ref<PerDiem | null | undefined>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<PerDiem>,
 *   refresh: () => Promise<PerDiem>,
 * }}
 */

/** @type {UsePerDiem} */
export function usePerDiem(perDiemId) {
  const state = reactive({
    perDiem: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    const staticPerDiemId = unref(perDiemId)
    if (isNil(staticPerDiemId)) {
      throw new Error("perDiemId is required")
    }

    state.isLoading = true
    try {
      const { perDiem } = await perDiemsApi.get(staticPerDiemId)

      state.isErrored = false
      state.perDiem = perDiem

      return perDiem
    } catch (error) {
      console.error("Failed to fetch per diem:", error)

      state.isErrored = true

      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(perDiemId),
    async (newPerDiemId) => {
      if (isNil(newPerDiemId)) {
        return
      }

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default usePerDiem
```

**Output:** `use-per-diem.ts`

```typescript
import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import perDiemsApi, { type PerDiem, type PerDiemPolicy } from "@/api/per-diems-api"

export { type PerDiem, type PerDiemPolicy }

export function usePerDiem(perDiemId: Ref<number | null | undefined>) {
  const state = reactive<{
    perDiem: PerDiem | null
    policy: PerDiemPolicy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    perDiem: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<PerDiem> {
    const staticPerDiemId = unref(perDiemId)
    if (isNil(staticPerDiemId)) {
      throw new Error("perDiemId is required")
    }

    state.isLoading = true
    try {
      const { perDiem, policy } = await perDiemsApi.get(staticPerDiemId)

      state.isErrored = false
      state.perDiem = perDiem
      state.policy = policy

      return perDiem
    } catch (error) {
      console.error(`Failed to fetch per diem: ${error}`, { error })

      state.isErrored = true

      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(perDiemId),
    async (newPerDiemId) => {
      if (isNil(newPerDiemId)) {
        return
      }

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default usePerDiem
```

---

## Example with Save Method

**Output:** `use-travel-desk-travel-agency.ts`

```typescript
import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import { type Policy } from "@/api/base-api"
import travelDeskTravelAgenciesApi, {
  type TravelDeskTravelAgency,
} from "@/api/travel-desk-travel-agencies-api"

export { type TravelDeskTravelAgency }

export function useTravelDeskTravelAgency(
  travelDeskTravelAgencyId: Ref<number | null | undefined>
) {
  const state = reactive<{
    travelDeskTravelAgency: TravelDeskTravelAgency | null
    policy: Policy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskTravelAgency: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskTravelAgency> {
    const staticTravelDeskTravelAgencyId = unref(travelDeskTravelAgencyId)
    if (isNil(staticTravelDeskTravelAgencyId)) {
      throw new Error("travelDeskTravelAgencyId is required")
    }

    state.isLoading = true
    try {
      const { travelDeskTravelAgency, policy } = await travelDeskTravelAgenciesApi.get(
        staticTravelDeskTravelAgencyId
      )

      state.isErrored = false
      state.travelDeskTravelAgency = travelDeskTravelAgency
      state.policy = policy

      return travelDeskTravelAgency
    } catch (error) {
      console.error(`Failed to fetch travel desk travel agency: ${error}`, { error })

      state.isErrored = true

      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<TravelDeskTravelAgency> {
    const staticTravelDeskTravelAgencyId = unref(travelDeskTravelAgencyId)
    if (isNil(staticTravelDeskTravelAgencyId)) {
      throw new Error("travelDeskTravelAgencyId is required")
    }

    if (isNil(state.travelDeskTravelAgency)) {
      throw new Error("No travel desk travel agency to save")
    }

    state.isLoading = true
    try {
      const { travelDeskTravelAgency, policy } = await travelDeskTravelAgenciesApi.update(
        staticTravelDeskTravelAgencyId,
        state.travelDeskTravelAgency
      )

      state.isErrored = false
      state.travelDeskTravelAgency = travelDeskTravelAgency
      state.policy = policy

      return travelDeskTravelAgency
    } catch (error) {
      console.error(`Failed to save travel desk travel agency: ${error}`, { error })

      state.isErrored = true

      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(travelDeskTravelAgencyId),
    async (newTravelDeskTravelAgencyId) => {
      if (isNil(newTravelDeskTravelAgencyId)) {
        return
      }

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    save,
  }
}

export default useTravelDeskTravelAgency
```

---

## Checklist

- [ ] File renamed from `.js` to `.ts`
- [ ] `type Ref` imported from Vue
- [ ] `type Policy` imported from base-api (if API returns policy)
- [ ] Resource type imported from API file
- [ ] All JSDoc type definitions removed
- [ ] Types re-exported for convenience
- [ ] Function parameter typed as `Ref<number | null | undefined>`
- [ ] Reactive state has explicit generic type
- [ ] `policy` added to state (if API returns policy)
- [ ] All async functions have return type annotations
- [ ] Error logging uses template literal format
- [ ] Save method has null check for state object
- [ ] TypeScript compiles without errors

---

## Variations

### Read-Only Composable (no save)

If the API only has `get()` without `update()`:

- Don't include `save()` method
- May omit `policy` from state if API doesn't return it

### Composable with Custom Actions

For stateful actions like `submit()`, `approve()`, etc.:

```typescript
/** @deprecated - prefer inline api calls for state changes */
async function submit(): Promise<ResourceAsShow> {
  const staticResourceId = unref(resourceId)
  if (isNil(staticResourceId)) {
    throw new Error("resourceId is required")
  }

  if (isNil(state.resource)) {
    throw new Error("No resource to submit")
  }

  state.isLoading = true
  try {
    const { resource } = await resourcesApi.submit(staticResourceId, state.resource)

    state.isErrored = false
    state.resource = resource

    return resource
  } catch (error) {
    console.error(`Failed to submit resource: ${error}`, { error })

    state.isErrored = true

    throw error
  } finally {
    state.isLoading = false
  }
}
```

**Note:** Add `@deprecated` comment for stateful actions - prefer inline API calls in components.

### Composable with Computed Properties

```typescript
import { computed, type Ref, reactive, toRefs, unref, watch } from "vue"

// ... in function body:

const computedField = computed(() => state.resource?.someField)

return {
  ...toRefs(state),
  computedField,
  fetch,
  refresh: fetch,
}
```

---

## Common Pitfalls

1. **Forgetting `type Ref` import** - Required for parameter typing
2. **Using `.js` extension in imports** - Remove file extensions
3. **Missing null check in save** - Always check `state.resource` before update
4. **Wrong type for state property** - Use `ResourceAsShow | null`, not `ResourceAsShow | null | undefined`
5. **Forgetting to re-export types** - Consumers expect types from composable
6. **Not updating error message format** - Use template literal with error object
7. **Missing policy in state** - Add if API returns policy

---

## Related Workflows

- [convert-js-api-to-typescript.md](convert-js-api-to-typescript.md) - Convert API file first if needed
- (Future) `convert-js-plural-composable-to-typescript.md` - For list composables

---

**Workflow Version:** 1.1
**Last Updated:** 2026-01-15
**Reference Files:** `use-user.ts`, `use-expense.ts`, `use-travel-purpose.ts`, `use-travel-desk-travel-request.ts`
