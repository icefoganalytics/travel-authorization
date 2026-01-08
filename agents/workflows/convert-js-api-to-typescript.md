---
description: Workflow for converting JavaScript API client files to TypeScript with proper typing, enums, and query options.
auto_execution_mode: 1
---

# Convert JavaScript API to TypeScript Workflow

> **Purpose:** Convert a JavaScript API client file to TypeScript following project conventions.
>
> **Scope:** Frontend API client conversion
>
> **Reference Files:** `travel-desk-flight-requests-api.ts`, `expenses-api.ts`, `per-diems-api.ts`

## Prerequisites

Before starting, ensure:

- [ ] The JavaScript API file exists in `web/src/api/`
- [ ] You have read the corresponding backend model to understand types
- [ ] You understand the API methods available (list, get, create, update, delete)

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
- Import `Policy` if `get()` or `update()` methods return policy
- Import other types if needed (e.g., `AttachmentAsReference`)

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

### 4. Define Base Type from Backend Model

**Read the backend model** to understand all fields and their types.

**Template:**
```typescript
/** Keep in sync with api/src/models/{model}.ts */
export type ResourceName = {
  id: number
  foreignKeyId: number
  stringField: string
  nullableStringField: string | null
  booleanField: boolean
  nullableBooleanField: boolean | null
  dateField: string  // Dates are serialized as ISO strings
  nullableDateField: string | null
  enumField: ResourceStatuses
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

### 5. Define Serializer-Specific Types (if needed)

If index/show endpoints return different shapes:

```typescript
export type ResourceAsIndex = Resource & {
  computedField: string
  nestedObject: NestedType | null
}

export type ResourceAsShow = Resource & {
  additionalDetails: string
}

export type ResourceAsReference = Pick<
  Resource,
  | "id"
  | "fieldA"
  | "fieldB"
  | "createdAt"
  | "updatedAt"
>
```

---

### 6. Define Query Option Types

**WhereOptions** - fields that can be filtered by exact match:
```typescript
export type ResourceWhereOptions = WhereOptions<
  Resource,
  | "id"
  | "foreignKeyId"
  | "status"
  | "type"
>
```

**FiltersOptions** - custom filter scopes from backend:

> **Note:** These filter names come from the backend model's `static establishScopes()` method.
> Look for `this.addScope("scopeName", ...)` and `this.addSearchScope([...])` calls.
> Example from `api/src/models/user.ts`:
> ```typescript
> static establishScopes(): void {
>   this.addSearchScope(["firstName", "lastName", "email"])
>   this.addScope("isTravelDeskUser", () => { ... })
> }
> ```
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
export type ResourceQueryOptions = QueryOptions<
  ResourceWhereOptions,
  ResourceFiltersOptions
>
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

export const travelDeskRentalCarsApi = {
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarStatuses,
  TravelDeskRentalCarVehicleTypes,
  LOCATION_TYPES,
  TRAVEL_DESK_RENTAL_CAR_STATUSES,
  VEHICLE_TYPES,

  async list(params: TravelDeskRentalCarsQueryOptions = {}): Promise<{
    travelDeskRentalCars: TravelDeskRentalCar[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-rental-cars", { params })
    return data
  },

  async get(travelDeskRentalCarId: number): Promise<{
    travelDeskRentalCar: TravelDeskRentalCar
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-rental-cars/${travelDeskRentalCarId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskRentalCar>): Promise<{
    travelDeskRentalCar: TravelDeskRentalCar
  }> {
    const { data } = await http.post("/api/travel-desk-rental-cars", attributes)
    return data
  },

  async update(
    travelDeskRentalCarId: number,
    attributes: Partial<TravelDeskRentalCar>
  ): Promise<{
    travelDeskRentalCar: TravelDeskRentalCar
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
- [ ] Base type defined from backend model
- [ ] WhereOptions defined with filterable fields
- [ ] FiltersOptions defined (or `Record<never, never>` if none)
- [ ] QueryOptions defined combining where and filters
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

1. **Forgetting `| null` for nullable fields** - Check backend model for null defaults
2. **Using `Date` instead of `string`** - Dates are serialized as ISO strings
3. **Missing Policy import** - Required if get/update return policy
4. **Not updating WhereOptions** - Only include fields that backend actually filters
5. **Wrong enum naming** - Use `{ModelName}{FieldName}` pattern
6. **Forgetting deprecated comments** - Keep backward compatibility
7. **Not checking backend serializers** - Return types may differ from base model

---

**Workflow Version:** 1.0
**Last Updated:** 2026-01-08
**Reference Files:** `travel-desk-flight-requests-api.ts`, `expenses-api.ts`, `per-diems-api.ts`
