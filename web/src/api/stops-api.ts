import http from "@/api/http-client"
import { QueryOptions, type FiltersOptions, type WhereOptions } from "@/api/base-api"

/** Keep in sync with api/src/models/travel-segment.ts */
export enum StopsAccommodationTypes {
  HOTEL = "Hotel",
  PRIVATE = "Private",
  OTHER = "Other:",
}

/** @deprecated - prefer enum equivalent `AccommodationTypes` */
export const ACCOMMODATION_TYPES = Object.freeze({
  HOTEL: "Hotel",
  PRIVATE: "Private",
  OTHER: "Other:",
})

/** Keep in sync with api/src/models/travel-segment.ts */
export enum StopsTravelMethods {
  AIRCRAFT = "Aircraft",
  POOL_VEHICLE = "Pool Vehicle",
  PERSONAL_VEHICLE = "Personal Vehicle",
  RENTAL_VEHICLE = "Rental Vehicle",
  BUS = "Bus",
  OTHER = "Other:",
}

/** @deprecated - prefer enum equivalent `TravelMethods` */
export const TRAVEL_METHODS = Object.freeze({
  AIRCRAFT: "Aircraft",
  POOL_VEHICLE: "Pool Vehicle",
  PERSONAL_VEHICLE: "Personal Vehicle",
  RENTAL_VEHICLE: "Rental Vehicle",
  BUS: "Bus",
  OTHER: "Other:",
})

export type Stop = {
  id: number
  travelAuthorizationId: number
  locationId: number
  accommodationType: StopsAccommodationTypes | null
  departureDate: string | null
  departureTime: string | null
  transport: StopsTravelMethods | null
  isActual: boolean
  createdAt: string
  updatedAt: string
}

export type StopAsReference = Pick<
  Stop,
  | "id"
  | "travelAuthorizationId"
  | "locationId"
  | "departureDate"
  | "transport"
  | "accommodationType"
  | "isActual"
  | "createdAt"
  | "updatedAt"
> & {
  departureTime: string | null
}

export type StopWhereOptions = WhereOptions<Stop, "id" | "travelAuthorizationId" | "locationId">

export type StopFiltersOptions = FiltersOptions<Record<never, never>>

export type StopsQueryOptions = QueryOptions<StopWhereOptions, StopFiltersOptions>

/**
 * DEPRECATED: Whenever you use this model, try and figure out how to migrate
 * the functionality to the TravelSegment model instead.
 * It was too large a project to migrate to the TravelSegment model all at once,
 * so we're doing it piecemeal.
 */
export const stopsApi = {
  StopsTravelMethods,
  StopsAccommodationTypes,
  TRAVEL_METHODS,
  ACCOMMODATION_TYPES,

  async list(params: StopsQueryOptions = {}): Promise<{
    stops: Stop[]
  }> {
    const { data } = await http.get("/api/stops", { params })
    return data
  },
}

export default stopsApi
