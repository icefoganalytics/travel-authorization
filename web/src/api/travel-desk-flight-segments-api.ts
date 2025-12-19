import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-flight-segment.ts */
export type TravelDeskFlightSegment = {
  id: number
  flightOptionId: number
  flightNumber: string
  departAt: string
  departLocation: string
  arriveAt: string
  arriveLocation: string
  duration: string
  status: string
  class: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type TravelDeskFlightSegmentWhereOptions = WhereOptions<
  TravelDeskFlightSegment,
  | "id"
  | "flightOptionId"
  | "flightNumber"
  | "departLocation"
  | "arriveLocation"
  | "status"
  | "class"
  | "sortOrder"
>

/** must match model scopes */
export type TravelDeskFlightSegmentFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskFlightSegmentsQueryOptions = QueryOptions<
  TravelDeskFlightSegmentWhereOptions,
  TravelDeskFlightSegmentFiltersOptions
>

export const travelDeskFlightSegmentsApi = {
  async list(params: TravelDeskFlightSegmentsQueryOptions = {}): Promise<{
    travelDeskFlightSegments: TravelDeskFlightSegment[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-flight-segments", {
      params,
    })
    return data
  },

  async get(travelDeskFlightSegmentId: number): Promise<{
    travelDeskFlightSegment: TravelDeskFlightSegment
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-flight-segments/${travelDeskFlightSegmentId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskFlightSegment>): Promise<{
    travelDeskFlightSegment: TravelDeskFlightSegment
  }> {
    const { data } = await http.post("/api/travel-desk-flight-segments", attributes)
    return data
  },

  async update(
    travelDeskFlightSegmentId: number,
    attributes: Partial<TravelDeskFlightSegment>
  ): Promise<{
    travelDeskFlightSegment: TravelDeskFlightSegment
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-flight-segments/${travelDeskFlightSegmentId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskFlightSegmentId: number): Promise<void> {
    await http.delete(`/api/travel-desk-flight-segments/${travelDeskFlightSegmentId}`)
  },
}

export default travelDeskFlightSegmentsApi
