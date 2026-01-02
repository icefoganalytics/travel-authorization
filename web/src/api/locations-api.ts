import http from "@/api/http-client"
import { type FiltersOptions, type QueryOptions, type WhereOptions } from "@/api/base-api"

import debounceWithArgsCache from "@/utils/debounce-with-args-cache"

export type Location = {
  id: number
  province: string
  city: string
  createdAt: string
  updatedAt: string
}

export type LocationAsReference = Pick<
  Location,
  "id" | "city" | "province" | "createdAt" | "updatedAt"
>

export type LocationWhereOptions = WhereOptions<Location, "id" | "province" | "city">

export type LocationFiltersOptions = FiltersOptions<{
  byProvince: string | string[]
}>

export type LocationsQueryOptions = QueryOptions<LocationWhereOptions, LocationFiltersOptions>

export const locationsApi = {
  async list(params: LocationsQueryOptions = {}): Promise<{
    locations: Location[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/locations", { params })
    return data
  },

  async get(locationId: number): Promise<{
    location: Location
  }> {
    const { data } = await http.get(`/api/locations/${locationId}`)
    return data
  },
}

locationsApi.list = debounceWithArgsCache(locationsApi.list, {
  trailing: false,
})

export default locationsApi
