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

Rename `.js` to `.ts`:

```bash
git mv web/src/api/{resource}-api.js web/src/api/{resource}-api.ts
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

**Note:** Ideally backend should have serializers, but pragmatically you can proceed without them using aliases.

**Step 3: Verify backend serializer naming**

If backend uses old naming like `{Resource}IndexView`, rename it to `{Resource}AsIndex` pattern.

**API Method Return Type Pattern:**

- `list()` → Always returns `{resources: ResourceAsIndex[], totalCount: number}`
- `get()` → Returns `{resource: ResourceAsShow, policy: Policy}`
- `create()` → Returns `{resource: ResourceAsShow}` or `{resource: ResourceAsShow, policy: Policy}`
- `update()` → Returns `{resource: ResourceAsShow, policy: Policy}`
- `delete()` → Returns `Promise<void>`

**Note:** Always use `AsShow` for get/create/update, even if it's just an alias to the base model.

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

**Before (JS):**

```javascript
export const resourceApi = {
  async list({ where, page, perPage, ...otherParams } = {}) {
    const { data } = await http.get("/api/resources", {
      params: { where, page, perPage, ...otherParams },
    })
    return data
  },
  async get(resourceId, params = {}) {
    const { data } = await http.get(`/api/resources/${resourceId}`, { params })
    return data
  },
  async create(attributes) {
    const { data } = await http.post("/api/resources", attributes)
    return data
  },
  async update(resourceId, attributes) {
    const { data } = await http.patch(`/api/resources/${resourceId}`, attributes)
    return data
  },
  async delete(resourceId) {
    const { data } = await http.delete(`/api/resources/${resourceId}`)
    return data
  },
}
```

**After (TS):**

```typescript
export const resourcesApi = {
  async list(params: ResourceQueryOptions = {}): Promise<{
    resources: ResourceAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/resources", { params })
    return data
  },

  async get(resourceId: number): Promise<{
    resource: ResourceAsShow
    policy: Policy
  }> {
    const { data } = await http.get(`/api/resources/${resourceId}`)
    return data
  },

  async create(attributes: Partial<Resource>): Promise<{
    resource: ResourceAsShow
    policy: Policy
  }> {
    const { data } = await http.post("/api/resources", attributes)
    return data
  },

  async update(
    resourceId: number,
    attributes: Partial<Resource>
  ): Promise<{
    resource: ResourceAsShow
    policy: Policy
  }> {
    const { data } = await http.patch(`/api/resources/${resourceId}`, attributes)
    return data
  },

  async delete(resourceId: number): Promise<void> {
    const { data } = await http.delete(`/api/resources/${resourceId}`)
    return data
  },
}
```

**Key Changes:**

- Add parameter types
- Add return type annotations with `Promise<{...}>`
- Use `params: QueryOptions` for list instead of destructuring

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

### 9. Keep Default Export

```typescript
export default resourcesApi
```

---

## Complete Example

**Input:** `travel-desk-rental-cars-api.js`

```javascript
import http from "@/api/http-client"

export const LOCATION_TYPES = Object.freeze({
  AIRPORT: "Airport",
  HOTEL: "Hotel",
  DOWNTOWN: "Downtown",
  OTHER: "Other",
})

export const TRAVEL_DESK_RENTAL_CAR_STATUSES = Object.freeze({
  REQUESTED: "Requested",
  RESERVED: "Reserved",
})

export const VEHICLE_TYPES = Object.freeze({
  ECONOMY: "Economy",
  COMPACT: "Compact",
  // ... more values
})

export const travelDeskRentalCarsApi = {
  async list({ where, page, perPage, ...otherParams } = {}) {
    const { data } = await http.get("/api/travel-desk-rental-cars", {
      params: { where, page, perPage, ...otherParams },
    })
    return data
  },
  async get(travelDeskRentalCarId, params = {}) {
    const { data } = await http.get(`/api/travel-desk-rental-cars/${travelDeskRentalCarId}`, {
      params,
    })
    return data
  },
  // ... more methods
}

export default travelDeskRentalCarsApi
```

**Output:** `travel-desk-rental-cars-api.ts`

```typescript
import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

// Step 1: Copy enums from backend model

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export enum TravelDeskRentalCarLocationTypes {
  AIRPORT = "Airport",
  HOTEL = "Hotel",
  DOWNTOWN = "Downtown",
  OTHER = "Other",
}

/** @deprecated - prefer enum equivalent `TravelDeskRentalCarLocationTypes` */
export const LOCATION_TYPES = Object.freeze({
  AIRPORT: "Airport",
  HOTEL: "Hotel",
  DOWNTOWN: "Downtown",
  OTHER: "Other",
})

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export enum TravelDeskRentalCarStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/** @deprecated - prefer enum equivalent `TravelDeskRentalCarStatuses` */
export const TRAVEL_DESK_RENTAL_CAR_STATUSES = Object.freeze({
  REQUESTED: "Requested",
  RESERVED: "Reserved",
})

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export enum TravelDeskRentalCarVehicleTypes {
  ECONOMY = "Economy",
  COMPACT = "Compact",
  INTERMEDIATE = "Intermediate",
  STANDARD = "Standard",
  FULL_SIZE = "Full-Size",
  INTERMEDIATE_SUV = "Intermediate SUV",
  LUXURY = "Luxury",
  MINIVAN = "Minivan",
  STANDARD_SUV = "Standard SUV",
  FULL_SIZE_SUV = "Full-Size SUV",
  PICKUP_TRUCK = "Pickup Truck",
}

/** @deprecated - prefer enum equivalent `TravelDeskRentalCarVehicleTypes` */
export const VEHICLE_TYPES = Object.freeze({
  ECONOMY: "Economy",
  COMPACT: "Compact",
  INTERMEDIATE: "Intermediate",
  STANDARD: "Standard",
  FULL_SIZE: "Full-Size",
  INTERMEDIATE_SUV: "Intermediate SUV",
  LUXURY: "Luxury",
  MINIVAN: "Minivan",
  STANDARD_SUV: "Standard SUV",
  FULL_SIZE_SUV: "Full-Size SUV",
  PICKUP_TRUCK: "Pickup Truck",
})

// Step 2: Define AsIndex type (copy from backend or create alias)

// If backend has serializer, copy it:
/** Keep in sync with api/src/serializers/travel-desk-rental-cars/index-serializer.ts */
export type TravelDeskRentalCarAsIndex = Pick<
  TravelDeskRentalCar,
  | "id"
  | "travelRequestId"
  | "pickUpCity"
  | "pickUpLocation"
  | "pickUpDate"
  | "dropOffDate"
  | "vehicleType"
  | "status"
  | "createdAt"
  | "updatedAt"
>

// If backend has NO serializer, create alias:
// export type TravelDeskRentalCarAsIndex = TravelDeskRentalCar
// export type TravelDeskRentalCarAsShow = TravelDeskRentalCar

// Step 3: Define specific policy type for consistency
export type TravelDeskRentalCarPolicy = Policy

// Step 4: Define base model type for reference and create/update payloads

/** Keep in sync with api/src/models/travel-desk-rental-car.ts */
export type TravelDeskRentalCar = {
  id: number
  travelRequestId: number
  pickUpCity: string
  pickUpLocation: string
  pickUpLocationOther: string | null
  dropOffCity: string | null
  dropOffLocation: string | null
  dropOffLocationOther: string | null
  sameDropOffLocation: boolean
  matchFlightTimes: boolean
  vehicleTypeChangeIndicator: string | null
  vehicleType: string
  vehicleChangeRationale: string | null
  pickUpDate: string
  dropOffDate: string
  additionalNotes: string | null
  status: string
  reservedVehicleInfo: string | null
  booking: string | null
  createdAt: string
  updatedAt: string
}

// Step 5: Define query options

export type TravelDeskRentalCarWhereOptions = WhereOptions<
  TravelDeskRentalCar,
  | "id"
  | "travelRequestId"
  | "pickUpCity"
  | "pickUpLocation"
  | "dropOffCity"
  | "dropOffLocation"
  | "vehicleType"
  | "status"
>

/** must match model scopes */
export type TravelDeskRentalCarFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskRentalCarsQueryOptions = QueryOptions<
  TravelDeskRentalCarWhereOptions,
  TravelDeskRentalCarFiltersOptions
>

// Step 5: Define API methods with proper serializer return types

export const travelDeskRentalCarsApi = {
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarStatuses,
  TravelDeskRentalCarVehicleTypes,
  LOCATION_TYPES,
  TRAVEL_DESK_RENTAL_CAR_STATUSES,
  VEHICLE_TYPES,

  async list(params: TravelDeskRentalCarsQueryOptions = {}): Promise<{
    travelDeskRentalCars: TravelDeskRentalCarAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-rental-cars", { params })
    return data
  },

  async get(travelDeskRentalCarId: number): Promise<{
    travelDeskRentalCar: TravelDeskRentalCarAsShow
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-rental-cars/${travelDeskRentalCarId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskRentalCar>): Promise<{
    travelDeskRentalCar: TravelDeskRentalCarAsShow
  }> {
    const { data } = await http.post("/api/travel-desk-rental-cars", attributes)
    return data
  },

  async update(
    travelDeskRentalCarId: number,
    attributes: Partial<TravelDeskRentalCar>
  ): Promise<{
    travelDeskRentalCar: TravelDeskRentalCarAsShow
    policy: Policy
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-rental-cars/${travelDeskRentalCarId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskRentalCarId: number): Promise<void> {
    const { data } = await http.delete(`/api/travel-desk-rental-cars/${travelDeskRentalCarId}`)
    return data
  },
}

export default travelDeskRentalCarsApi
```

---

## Checklist

- [ ] File renamed from `.js` to `.ts`
- [ ] Imports updated with base-api types
- [ ] Object.freeze constants converted to enums
- [ ] Deprecated comments added to old constants
- [ ] Backend serializers checked
- [ ] AsIndex/AsShow types defined (copied from backend or aliased from base model)
- [ ] Base model type defined
- [ ] Policy type defined: `export type ResourcePolicy = Policy`
- [ ] WhereOptions defined with filterable fields
- [ ] FiltersOptions defined (or `Record<never, never>` if none)
- [ ] QueryOptions defined combining where and filters
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

**Workflow Version:** 1.2
**Last Updated:** 2026-01-15
**Reference Files:** `travel-desk-flight-requests-api.ts`, `travel-desk-hotels-api.ts`, `expenses-api.ts`, `per-diems-api.ts`
