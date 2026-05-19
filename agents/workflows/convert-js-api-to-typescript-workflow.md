---
description: Workflow for converting JavaScript API client files to TypeScript with proper typing, enums, and query options.
auto_execution_mode: 1
---

# Convert JavaScript API to TypeScript Workflow

## Intent

**WHY this workflow exists:** JavaScript API files lack type safety, making refactoring risky and IDE support limited. TypeScript conversion provides compile-time type checking, better autocomplete, and documents the API contract.

**WHAT this workflow produces:** A TypeScript API file with:
- Typed model definitions matching backend
- Enums for status/type constants (with deprecated Object.freeze for backward compatibility)
- Typed query options (WhereOptions, FiltersOptions, QueryOptions)
- Properly typed API methods with return types using AsIndex/AsShow pattern

**Decision Rule:** When in doubt about a type, check the backend model first (`api/src/models/{model}.ts`), then backend serializers (`api/src/serializers/{model}/`). The frontend types must match what the backend actually returns.
- **Association rule:** If the frontend response includes related records that are not part of the base model, prefer adding or aligning backend serializers and then mirror those `AsIndex` / `AsShow` shapes in the frontend API file instead of inventing ad hoc nested types locally.

## Reference Files

`travel-desk-flight-requests-api.ts`, `expenses-api.ts`, `per-diems-api.ts`

## Prerequisites

Before starting, ensure:

- [ ] The JavaScript API file exists in `web/src/api/`
- [ ] You have read the corresponding backend model to understand types
- [ ] You understand the API methods available (list, get, create, update, delete)
- [ ] You've checked if backend serializers exist for these endpoints

---

## Conversion Steps

### 1. Update File Extension

**Important:** A proper TypeScript conversion requires two steps: (1) rename the file from .js to .ts, and (2) update the content from JavaScript + JSDoc to TypeScript. Do not create new .ts files - convert the existing files in place.

Rename `.js` to `.ts` using git mv to preserve file history:

```bash
git mv web/src/api/{resource}-api.js web/src/api/{resource}-api.ts
```

If `git mv` fails (e.g., file already exists), delete the old file after creating the new one:

```bash
rm web/src/api/{resource}-api.js
```

### 2. Update Imports

**Before (JS):**

```javascript
import http from "@/api/http-client"
```

**After (TS):**

```typescript
import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
```

**Note:** Do not import `ModelOrder` - use `QueryOptions` which handles ordering internally.

**Import Selection:**

- Always import `WhereOptions`, `FiltersOptions`, `QueryOptions` from `base-api`
- Import `Policy` from `base-api` if `get()` or `update()` methods return policy
- Import other types if needed (e.g., `AttachmentAsReference`)
- Note: API files should define `export type ResourcePolicy = Policy` for consistency

---

### 3. Convert Object.freeze Constants to Enums

**Before (JS):**

```javascript
/** Keep in sync with api/src/models/resource.ts */
export const STATUSES = Object.freeze({
  REQUESTED: "Requested",
  RESERVED: "Reserved",
})

export const TYPES = Object.freeze({
  TYPE_A: "TypeA",
  TYPE_B: "TypeB",
})
```

**After (TS):**

```typescript
/** Keep in sync with api/src/models/resource.ts */
export enum ResourceStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/** @deprecated - prefer enum equivalent `ResourceStatuses` */
export const STATUSES = Object.freeze({
  REQUESTED: "Requested",
  RESERVED: "Reserved",
})

/** Keep in sync with api/src/models/resource.ts */
export enum ResourceTypes {
  TYPE_A = "TypeA",
  TYPE_B = "TypeB",
}

/** @deprecated - prefer enum equivalent `ResourceTypes` */
export const TYPES = Object.freeze({
  TYPE_A: "TypeA",
  TYPE_B: "TypeB",
})
```

**Naming Convention:**

- Enum name: `{ModelName}{FieldName}` in PascalCase (e.g., `TravelDeskRentalCarStatuses`, `PerDiemClaimTypes`)
- Keep deprecated Object.freeze for backward compatibility
- Add `@deprecated` JSDoc comment pointing to enum equivalent

---

### 4. Check Backend Serializers and Define View Types

**Step 1: Check if backend serializers exist**

Look in `api/src/serializers/{resource-name}/`:
- `index-serializer.ts` - for list endpoint
- `show-serializer.ts` - for get/update endpoints

**Step 2a: If serializers EXIST - Copy them**

```typescript
// Backend has: api/src/serializers/expenses/index-serializer.ts
export type ExpenseAsIndex = Expense & {
  receipt: AttachmentAsReference | null
}

// Copy to frontend:
export type ExpenseAsIndex = Expense & {
  receipt: AttachmentAsReference | null
}

export type ExpenseAsShow = Expense & {
  receipt: AttachmentAsReference | null
}
```

**Step 2b: If serializers DON'T EXIST - Create type aliases**

Don't block on missing serializers. Create simple aliases:

```typescript
// No backend serializers? Just alias the base type:
export type TravelDeskFlightRequestAsIndex = TravelDeskFlightRequest
export type TravelDeskFlightRequestAsShow = TravelDeskFlightRequest
```

**Note:** Ideally backend should have serializers, but pragmatically you can proceed without them using aliases for flat resources. If the response includes associations or computed nested shapes, add or align backend serializers first so the frontend API type stays grounded in the actual response contract.

**Important:** Place AsIndex and AsShow type definitions immediately after the base type definition, not after query options or other types. This keeps related types together.

**Step 3: Verify backend serializer naming**

If backend uses old naming like `{Resource}IndexView`, rename it to `{Resource}AsIndex` pattern.

**API Method Return Type Pattern:**

- `list()` → Always returns `{resources: ResourceAsIndex[], totalCount: number}`
- `get()` → Returns `{resource: ResourceAsShow, policy: Policy}`
- `create()` → Returns `{resource: ResourceAsShow}` or `{resource: ResourceAsShow, policy: Policy}`
- `update()` → Returns `{resource: ResourceAsShow, policy: Policy}`
- `delete()` → Returns `Promise<void>`

**Note:** Always use `AsShow` for get/create/update, even if it's just an alias to the base model.
When backend create/update actions reload associations and serialize the record, the frontend
`create()` and `update()` methods should return the serialized `AsShow` type, not the base model.

---

### 5. Define Base Model Type

**The base model type represents the full database model. It's used for `create()` payloads and as the foundation for AsIndex/AsShow types.**

**Read the backend model** at `api/src/models/{model}.ts`:

```typescript
/** Keep in sync with api/src/models/{model}.ts */
export type TravelDeskHotel = {
  id: number
  travelRequestId: number
  city: string
  isDedicatedConferenceHotelAvailable: boolean
  conferenceName: string | null
  conferenceHotelName: string | null
  checkIn: string
  checkOut: string
  additionalInformation: string | null
  status: string
  reservedHotelInfo: string | null
  booking: string | null
  createdAt: string
  updatedAt: string
}
```

**Type Mapping:**

| Backend Type | Frontend Type |
|-------------|---------------|
| `number` / `INTEGER` | `number` |
| `string` / `STRING` / `TEXT` | `string` |
| `boolean` / `BOOLEAN` | `boolean` |
| `Date` / `DATEONLY` / `DATE` | `string` (ISO format) |
| `null` optional | `T \| null` |
| Enum | Use the defined enum type |

**Important:** Exclude `deletedAt` from frontend types - it's almost never exposed in API responses and is only used internally for soft deletes.

---

### 6. Define Query Option Types

**WhereOptions** - fields that can be filtered by exact match:

```typescript
export type ResourceWhereOptions = WhereOptions<Resource, "id" | "foreignKeyId" | "status" | "type">
```

**FiltersOptions** - custom filter scopes from backend:

> **Note:** These filter names come from the backend model's `static establishScopes()` method.
> Look for `this.addScope("scopeName", ...)` and `this.addSearchScope([...])` calls.
> Example from `api/src/models/user.ts`:
>
> ```typescript
> static establishScopes(): void {
>   this.addSearchScope(["firstName", "lastName", "email"])
>   this.addScope("isTravelDeskUser", () => { ... })
> }
> ```
>
> This would translate to `FiltersOptions<{ search: string; isTravelDeskUser: boolean }>`.

```typescript
/** must match model scopes */
export type ResourceFiltersOptions = FiltersOptions<{
  search: string
  familyOf: number
  excludingIds: number[]
}>

// If no filters exist:
export type ResourceFiltersOptions = FiltersOptions<Record<never, never>>
```

**QueryOptions** - combines where, filters, pagination:

```typescript
export type ResourceQueryOptions = QueryOptions<ResourceWhereOptions, ResourceFiltersOptions>
```

---

### 7. Convert API Object Methods

**Key Changes:**

- Add parameter types
- Add return type annotations with `Promise<{...}>`
- Use `params: QueryOptions` for list instead of destructuring
- `list()` returns `ResourceAsIndex[]`
- `get()`/`update()` return `ResourceAsShow` with policy
- `create()` returns `ResourceAsShow` (with policy if applicable)

See workflow: `frontend-api-conversion-example.md` for complete before/after conversion example.

---

### 8. Export Enums on API Object (if applicable)

If constants are used by components, attach them to the API object:

```typescript
export const resourcesApi = {
  ResourceStatuses,
  ResourceTypes,
  // Deprecated but kept for backward compatibility
  STATUSES,
  TYPES,

  async list(...) { ... },
  // ...
}
```

---

### 8. Add Backend Serializers (If Missing)

If the backend controller doesn't have serializers, create them following the pattern from other controllers:

**Create serializer directory:**

```bash
mkdir -p api/src/serializers/{resource-name}
```

**Create serializers using templates:**

- Use template: `backend-index-serializer-template.md` for index-serializer.ts
- Use template: `backend-show-serializer-template.md` for show-serializer.ts
- Use template: `backend-serializer-index-template.md` for index.ts

**Add bundle export to api/src/serializers/index.ts:**

```typescript
export * as ResourceName from "./{resource-name}"
```

**Update controller to use serializers:**

```typescript
import { IndexSerializer, ShowSerializer } from "@/serializers/{resource-name}"

// In index():
const serializedResources = IndexSerializer.perform(resources, this.currentUser)

// In show():
const serializedResource = ShowSerializer.perform(resource, this.currentUser)

// In update():
const serializedResource = ShowSerializer.perform(resource, this.currentUser)
```

**Important:** Use `IndexSerializer.perform()` directly on arrays - don't map and call perform on each item. BaseSerializer handles arrays automatically.

---

### 9. Keep Default Export

```typescript
export default resourcesApi
```

---

## Complete Example

See template: `frontend-api-complete-example.md` for a complete before/after conversion example.

---

## Checklist

- [ ] File renamed from `.js` to `.ts` (or old file deleted if git mv fails)
- [ ] Imports updated with base-api types
- [ ] ModelOrder NOT imported (use QueryOptions instead)
- [ ] Object.freeze constants converted to enums
- [ ] Deprecated comments added to old constants
- [ ] Backend serializers checked
- [ ] AsIndex/AsShow types defined (copied from backend or aliased from base model)
- [ ] AsIndex/AsShow types placed immediately after base type definition
- [ ] Base model type defined
- [ ] deletedAt excluded from frontend type (almost never exposed)
- [ ] Policy type defined: `export type ResourcePolicy = Policy`
- [ ] WhereOptions defined with filterable fields
- [ ] FiltersOptions defined (or `Record<never, never>` if none)
- [ ] QueryOptions defined combining where and filters
- [ ] Backend serializers created if missing (index-serializer.ts, show-serializer.ts, index.ts)
- [ ] Bundle export added to api/src/serializers/index.ts
- [ ] Controller updated to use serializers
- [ ] `list()` returns `ResourceAsIndex[]`
- [ ] `get()`, `create()`, `update()` all return `ResourceAsShow`
- [ ] API method return types use serializer types, not base model
- [ ] All API methods have parameter types
- [ ] All API methods have return type annotations
- [ ] Enums attached to API object (if used by components)
- [ ] Default export preserved
- [ ] TypeScript compiles without errors

---

## Common Patterns

### API methods with optional params

```typescript
async get(
  resourceId: number,
  params: Record<string, unknown> = {}
): Promise<{ resource: Resource; policy: Policy }> {
  const { data } = await http.get(`/api/resources/${resourceId}`, { params })
  return data
}
```

### Custom action endpoints

```typescript
async submit(
  resourceId: number,
  attributes?: Partial<Resource>
): Promise<{ resource: Resource }> {
  const { data } = await http.post(`/api/resources/${resourceId}/submit`, attributes)
  return data
}
```

### Debounced API methods

```typescript
import debounceWithArgsCache from "@/utils/debounce-with-args-cache"

// ... api definition ...

resourcesApi.list = debounceWithArgsCache(resourcesApi.list, {
  trailing: false,
})
```

---

## Common Pitfalls

1. **Not using AsIndex/AsShow pattern** - Always use `ResourceAsIndex` for `list()` return type, even if it's just an alias.
2. **Blocking on missing serializers** - If backend doesn't have serializers, create type aliases and proceed. Ideally backend should have them, but don't block.
3. **Inconsistent return types** - `list()` should return `AsIndex[]`, `get()`/`update()` should return `AsShow` or base model.
4. **Using old serializer naming** - Backend should use `{Resource}AsIndex`, not `{Resource}IndexView`. Rename backend types if needed.
5. **Forgetting `| null` for nullable fields** - Check backend model for null defaults.
6. **Using `Date` instead of `string`** - Dates are serialized as ISO strings.
7. **Missing Policy import** - Required if get/update return policy.
8. **Not updating WhereOptions** - Only include fields that backend actually filters.
9. **Wrong enum naming** - Use `{ModelName}{FieldName}` pattern.
10. **Forgetting deprecated comments** - Keep backward compatibility.

---

**Workflow Version:** 1.5
**Last Updated:** 2026-04-13
**Reference Files:** `travel-desk-flight-requests-api.ts`, `travel-desk-hotels-api.ts`, `expenses-api.ts`, `per-diems-api.ts`, `flight-reconciliations-api.ts`

**Related Templates:**
- `backend-index-serializer-template.md` - Index serializer template
- `backend-show-serializer-template.md` - Show serializer template
- `backend-serializer-index-template.md` - Serializer index file template
- `frontend-api-typescript-template.md` - TypeScript API file structure template

**Related Workflows:**
- `frontend-api-conversion-example.md` - Complete before/after conversion example
