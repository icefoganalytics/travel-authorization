import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-segment.ts */
export enum TravelSegmentTravelMethods {
  AIRCRAFT = "Aircraft",
  POOL_VEHICLE = "Pool Vehicle",
  PERSONAL_VEHICLE = "Personal Vehicle",
  RENTAL_VEHICLE = "Rental Vehicle",
  BUS = "Bus",
  OTHER = "Other",
}

/** @deprecated - prefer enum equivalent `TravelMethods` */
export const TRAVEL_METHODS = {
  AIRCRAFT: "Aircraft",
  POOL_VEHICLE: "Pool Vehicle",
  PERSONAL_VEHICLE: "Personal Vehicle",
  RENTAL_VEHICLE: "Rental Vehicle",
  BUS: "Bus",
  OTHER: "Other", // value stored in modeOfTransportOther
}

/** Keep in sync with api/src/models/stop.ts */
export enum TravelSegmentAccommodationTypes {
  HOTEL = "Hotel",
  PRIVATE = "Private",
  OTHER = "Other",
}

/** @deprecated - prefer enum equivalent `AccommodationTypes` */
export const ACCOMMODATION_TYPES = {
  HOTEL: "Hotel",
  PRIVATE: "Private",
  OTHER: "Other", // value stored in accommodationTypeOther
}

export const PERMITTED_ATTRIBUTES_FOR_CLONE = [
  "departureLocationId",
  "arrivalLocationId",
  "departureOn",
  "departureTime",
  "modeOfTransport",
  "modeOfTransportOther",
  "accommodationType",
  "accommodationTypeOther",
] as const

/** Keep in sync with api/src/models/travel-segment.ts */
export type TravelSegment = {
  id: number
  travelAuthorizationId: number
  departureLocationId: number | null
  arrivalLocationId: number | null
  segmentNumber: number
  departureOn: string | null
  departureTime: string | null
  modeOfTransport: TravelSegmentTravelMethods
  modeOfTransportOther: string | null
  accommodationType: TravelSegmentAccommodationTypes | null
  accommodationTypeOther: string | null
  isActual: boolean
  createdAt: string
  updatedAt: string
}

export type TravelSegmentAsIndex = Pick<
  TravelSegment,
  | "id"
  | "travelAuthorizationId"
  | "isActual"
  | "departureLocationId"
  | "arrivalLocationId"
  | "segmentNumber"
  | "departureOn"
  | "departureTime"
  | "modeOfTransport"
  | "modeOfTransportOther"
  | "accommodationType"
  | "accommodationTypeOther"
  | "createdAt"
  | "updatedAt"
>

export type TravelSegmentAsReference = Pick<
  TravelSegment,
  | "id"
  | "travelAuthorizationId"
  | "isActual"
  | "departureLocationId"
  | "arrivalLocationId"
  | "segmentNumber"
  | "departureOn"
  | "departureTime"
  | "modeOfTransport"
  | "modeOfTransportOther"
  | "accommodationType"
  | "accommodationTypeOther"
  | "createdAt"
  | "updatedAt"
>

export type TravelSegmentWhereOptions = WhereOptions<
  TravelSegment,
  | "id"
  | "travelAuthorizationId"
  | "departureLocationId"
  | "arrivalLocationId"
  | "segmentNumber"
  | "departureOn"
  | "departureTime"
  | "modeOfTransport"
  | "modeOfTransportOther"
  | "accommodationType"
  | "accommodationTypeOther"
  | "isActual"
>

/** must match model scopes */
export type TravelSegmentFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelSegmentsQueryOptions = QueryOptions<
  TravelSegmentWhereOptions,
  TravelSegmentFiltersOptions
>

export const travelSegmentsApi = {
  TRAVEL_METHODS,
  ACCOMMODATION_TYPES,

  async list(params: TravelSegmentsQueryOptions = {}): Promise<{
    travelSegments: TravelSegment[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-segments", {
      params,
    })
    return data
  },

  async get(travelSegmentId: number): Promise<{
    travelSegment: TravelSegment
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-segments/${travelSegmentId}`)
    return data
  },

  async create(attributes: Partial<TravelSegment>): Promise<{
    travelSegment: TravelSegment
  }> {
    const { data } = await http.post("/api/travel-segments", attributes)
    return data
  },

  async update(
    travelSegmentId: number,
    attributes: Partial<TravelSegment>
  ): Promise<{
    travelSegment: TravelSegment
    policy: Policy
  }> {
    const { data } = await http.patch(`/api/travel-segments/${travelSegmentId}`, attributes)
    return data
  },

  async delete(travelSegmentId: number): Promise<void> {
    await http.delete(`/api/travel-segments/${travelSegmentId}`)
  },
}

export default travelSegmentsApi
