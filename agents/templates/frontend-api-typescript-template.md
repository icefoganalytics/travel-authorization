# Frontend API TypeScript Template

This template shows the structure of a converted TypeScript API file.

```typescript
import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

// Step 1: Copy enums from backend model

/** Keep in sync with api/src/models/{model}.ts */
export enum ResourceTypes {
  TYPE_A = "TypeA",
  TYPE_B = "TypeB",
}

/** @deprecated - prefer enum equivalent `ResourceTypes` */
export const TYPES = Object.freeze({
  TYPE_A = "TypeA",
  TYPE_B = "TypeB",
})

// Step 2: Define AsIndex type (copy from backend or create alias)

/** Keep in sync with api/src/serializers/{resource}/index-serializer.ts */
export type ResourceAsIndex = Pick<
  Resource,
  | "id"
  | "field1"
  | "field2"
  // ... all fields to expose in list views
>

// If backend has NO serializer, create alias:
// export type ResourceAsIndex = Resource
// export type ResourceAsShow = Resource

// Step 3: Define specific policy type for consistency
export type ResourcePolicy = Policy

// Step 4: Define base model type for reference and create/update payloads

/** Keep in sync with api/src/models/{model}.ts */
export type Resource = {
  id: number
  foreignKeyId: number
  field1: string
  field2: string | null
  // ... all model fields
  createdAt: string
  updatedAt: string
}

// Step 5: Define query options

export type ResourceWhereOptions = WhereOptions<
  Resource,
  | "id"
  | "foreignKeyId"
  | "field1"
  | "field2"
  | "status"
>

/** must match model scopes */
export type ResourceFiltersOptions = FiltersOptions<{
  search: string
}>

export type ResourceQueryOptions = QueryOptions<
  ResourceWhereOptions,
  ResourceFiltersOptions
>

// Step 6: Define API methods with proper serializer return types

export const resourcesApi = {
  ResourceTypes,
  TYPES,

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

export default resourcesApi
```

**Key patterns:**
- Import base-api types (FiltersOptions, Policy, QueryOptions, WhereOptions)
- Convert Object.freeze to TypeScript enums with deprecated comments
- Place AsIndex/AsShow types immediately after base type definition
- Use Pick<> to define AsIndex/AsShow from backend serializers
- Exclude deletedAt from frontend types (almost never exposed)
- Attach enums to API object for component use
