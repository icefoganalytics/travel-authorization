import http from "@/api/http-client"
import debounceWithArgsCache from "@/utils/debounce-with-args-cache"
import {
  type FiltersOptions,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type Location = {
  id: number
  province: string
  city: string
  createdAt: string
  updatedAt: string
}

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

  async fetch(locationId: number): Promise<Location> {
    const { data } = await http.get(`/api/locations/${locationId}`)
    return data
  },
}

locationsApi.list = debounceWithArgsCache(locationsApi.list, {
  trailing: false,
})

export default locationsApi
