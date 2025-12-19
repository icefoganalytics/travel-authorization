import http from "@/api/http-client"
import { type FiltersOptions, type QueryOptions, type WhereOptions } from "@/api/base-api"

export type TravelPurpose = {
  id: number
  purpose: string
  createdAt: string
  updatedAt: string
}

export type TravelPurposeAsReference = Pick<
  TravelPurpose,
  "id" | "purpose" | "createdAt" | "updatedAt"
>

export type TravelPurposeWhereOptions = WhereOptions<TravelPurpose, "id" | "purpose">

/** add as needed, must match model scopes */
export type TravelPurposeFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelPurposesQueryOptions = QueryOptions<
  TravelPurposeWhereOptions,
  TravelPurposeFiltersOptions
>

export const travelPurposesApi = {
  async list(params: TravelPurposesQueryOptions = {}): Promise<{
    travelPurposes: TravelPurpose[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-purposes", { params })
    return data
  },

  async get(travelPurposeId: number): Promise<{
    travelPurpose: TravelPurpose
  }> {
    const { data } = await http.get(`api/travel-purposes/${travelPurposeId}`)
    return data
  },
}

export default travelPurposesApi
