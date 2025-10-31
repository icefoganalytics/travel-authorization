import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** @deprecated - prefer enum equivalent `AllowanceTypes` */
export const TRAVEL_ALLOWANCE_ALLOWANCE_TYPES = Object.freeze({
  MAXIUM_AIRCRAFT_ALLOWANCE: "maxium_aircraft_allowance",
  AIRCRAFT_ALLOWANCE_PER_SEGMENT: "aircraft_allowance_per_segment",
  DISTANCE_ALLOWANCE_PER_KILOMETER: "distance_allowance_per_kilometer",
  HOTEL_ALLOWANCE_PER_NIGHT: "hotel_allowance_per_night",
})

/** @deprecated - prefer enum equivalent `CurrencyTypes` */
export const TRAVEL_ALLOWANCE_CURRENCY_TYPES = Object.freeze({
  USD: "USD",
  CAD: "CAD",
})

/** Keep in sync with api/src/models/travel-allowance.ts */
export enum AllowanceTypes {
  MAXIUM_AIRCRAFT_ALLOWANCE = "maxium_aircraft_allowance",
  AIRCRAFT_ALLOWANCE_PER_SEGMENT = "aircraft_allowance_per_segment",
  DISTANCE_ALLOWANCE_PER_KILOMETER = "distance_allowance_per_kilometer",
  HOTEL_ALLOWANCE_PER_NIGHT = "hotel_allowance_per_night",
}

/** Keep in sync with api/src/models/travel-allowance.ts */
export enum CurrencyTypes {
  USD = "USD",
  CAD = "CAD",
}

export type TravelAllowance = {
  id: string
  allowanceType: AllowanceTypes
  amount: number
  currency: CurrencyTypes
  createdAt: string
  updatedAt: string
}

export type TravelAllowanceWhereOptions = WhereOptions<
  TravelAllowance,
  "allowanceType" | "currency"
>

/** add as needed, must match model scopes */
export type TravelAllowanceFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelAllowancesQueryOptions = QueryOptions<
  TravelAllowanceWhereOptions,
  TravelAllowanceFiltersOptions
>

export const travelAllowancesApi = {
  async list(params: TravelAllowancesQueryOptions = {}): Promise<{
    travelAllowances: TravelAllowance[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-allowances", {
      params,
    })
    return data
  },

  async get(travelAllowanceId: number): Promise<{
    travelAllowance: TravelAllowance
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-allowances/${travelAllowanceId}`)
    return data
  },

  async update(
    travelAllowanceId: number,
    attributes: Partial<TravelAllowance>
  ): Promise<{
    travelAllowance: TravelAllowance
  }> {
    const { data } = await http.patch(`/api/travel-allowances/${travelAllowanceId}`, attributes)
    return data
  },
}

export default travelAllowancesApi
