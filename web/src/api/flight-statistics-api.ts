import http from "@/api/http-client"

import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/flight-statistic.ts */
export type FlightStatistic = {
  id: number
  /** NOTE: Multiple mail codes may map to the same department. */
  departmentMailcode: string
  destinationAirportCode: string
  destinationCity: string
  destinationProvince: string
  totalTrips: number
  totalRoundTrips: number
  totalDays: number
  totalExpenses: number
  totalFlightCost: number
  totalRoundTripCost: number
  averageDurationDays: number
  averageExpensesPerDay: number
  averageRoundTripFlightCost: number
  createdAt: string
  updatedAt: string
}

/** Keep in sync with api/src/serializers/flight-statistics/index-serializer.ts */
export type FlightStatisticAsIndex = Pick<
  FlightStatistic,
  | "id"
  | "departmentMailcode"
  | "destinationCity"
  | "destinationProvince"
  | "totalTrips"
  | "totalExpenses"
  | "totalFlightCost"
  | "totalDays"
  | "averageDurationDays"
  | "averageExpensesPerDay"
  | "averageRoundTripFlightCost"
  | "createdAt"
  | "updatedAt"
>

/** Keep in sync with api/src/serializers/flight-statistics/show-serializer.ts */
export type FlightStatisticAsShow = Pick<
  FlightStatistic,
  | "id"
  | "departmentMailcode"
  | "destinationAirportCode"
  | "destinationCity"
  | "destinationProvince"
  | "totalTrips"
  | "totalRoundTrips"
  | "totalDays"
  | "totalExpenses"
  | "totalFlightCost"
  | "totalRoundTripCost"
  | "averageDurationDays"
  | "averageExpensesPerDay"
  | "averageRoundTripFlightCost"
  | "createdAt"
  | "updatedAt"
>

export type FlightStatisticWhereOptions = WhereOptions<
  FlightStatistic,
  "id" | "departmentMailcode" | "destinationAirportCode" | "destinationCity" | "destinationProvince"
>

/** add as needed, must match model scopes */
export type FlightStatisticFiltersOptions = FiltersOptions<{
  byDepartmentMailcodes?: string[]
  byYukonDestinationCities?: string[]
  byCanadianDestinationProvinces?: string[]
  byInternationalDestinationProvinces?: string[]
  byLocations?: {
    byYukonDestinationCities?: string[]
    byCanadianDestinationProvinces?: string[]
    byInternationalDestinationProvinces?: string[]
  }
}>

export type FlightStatisticQueryOptions = QueryOptions<
  FlightStatisticWhereOptions,
  FlightStatisticFiltersOptions
>

export const flightStatisticsApi = {
  async list(params: FlightStatisticQueryOptions = {}): Promise<{
    flightStatistics: FlightStatisticAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/flight-statistics", { params })
    return data
  },
  async get(flightStatisticId: number): Promise<{
    flightStatistic: FlightStatisticAsShow
    policy: Policy
  }> {
    const { data } = await http.get(`/api/flight-statistics/${flightStatisticId}`)
    return data
  },
}

export default flightStatisticsApi
