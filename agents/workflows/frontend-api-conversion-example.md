---
description: Workflow showing a complete JavaScript to TypeScript API file conversion example
auto_execution_mode: 1
---

# Frontend API Conversion Example Workflow

This workflow demonstrates a complete JavaScript to TypeScript API file conversion, showing the before/after pattern.

## Input: JavaScript API File

`travel-desk-rental-cars-api.js`

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

## Output: TypeScript API File

`travel-desk-rental-cars-api.ts`

See template: `frontend-api-typescript-template.md` for the final TypeScript API file structure.

## Conversion Steps

1. **Update imports** - Add base-api types (FiltersOptions, Policy, QueryOptions, WhereOptions)
2. **Convert Object.freeze to enums** - Create TypeScript enums with deprecated Object.freeze for backward compatibility
3. **Define base model type** - Read backend model and create matching TypeScript type
4. **Define AsIndex/AsShow types** - Copy from backend serializers or create aliases
5. **Define query options** - Create WhereOptions, FiltersOptions, and QueryOptions types
6. **Convert API methods** - Add parameter types and return type annotations
7. **Attach enums to API object** - Export enums on the API object for component use

For detailed conversion instructions, see workflow: `convert-js-api-to-typescript.md`
