import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-flight-request.ts */
export enum TravelDeskFlightRequestSeatPreferenceTypes {
  WINDOW = "Window",
  AISLE = "Aisle",
  MIDDLE = "Middle",
  NO_PREFERENCE = "No Preference",
}

/** @deprecated - prefer enum equivalent `TravelDeskFlightRequestSeatPreferenceTypes` */
export const SEAT_PREFERENCE_TYPES = Object.freeze({
  WINDOW: "Window",
  AISLE: "Aisle",
  MIDDLE: "Middle",
  NO_PREFERENCE: "No Preference",
})

/** Keep in sync with api/src/models/travel-desk-flight-request.ts */
export enum TravelDeskFlightRequestTimePreferences {
  AM = "AM",
  PM = "PM",
}

/** @deprecated - prefer enum equivalent `TravelDeskFlightRequestTimePreferences` */
export const TRAVEL_DESK_FLIGHT_REQUEST_TIME_PREFERENCES = Object.freeze({
  AM: "AM",
  PM: "PM",
})

/** Keep in sync with api/src/models/travel-desk-flight-request.ts */
export type TravelDeskFlightRequest = {
  id: number
  travelRequestId: number
  departLocation: string
  arriveLocation: string
  datePreference: string
  timePreference: string
  seatPreference: string
  createdAt: string
  updatedAt: string
}

export type TravelDeskFlightRequestWhereOptions = WhereOptions<
  TravelDeskFlightRequest,
  | "id"
  | "travelRequestId"
  | "departLocation"
  | "arriveLocation"
  | "timePreference"
  | "seatPreference"
>

/** must match model scopes */
export type TravelDeskFlightRequestFiltersOptions = FiltersOptions<{
  familyOf: number
}>

export type TravelDeskFlightRequestsQueryOptions = QueryOptions<
  TravelDeskFlightRequestWhereOptions,
  TravelDeskFlightRequestFiltersOptions
>

export const travelDeskFlightRequestsApi = {
  TravelDeskFlightRequestSeatPreferenceTypes,
  TravelDeskFlightRequestTimePreferences,
  SEAT_PREFERENCE_TYPES,
  TRAVEL_DESK_FLIGHT_REQUEST_TIME_PREFERENCES,

  async list(params: TravelDeskFlightRequestsQueryOptions = {}): Promise<{
    travelDeskFlightRequests: TravelDeskFlightRequest[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-flight-requests", {
      params,
    })
    return data
  },

  async get(travelDeskFlightRequestId: number): Promise<{
    travelDeskFlightRequest: TravelDeskFlightRequest
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-flight-requests/${travelDeskFlightRequestId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskFlightRequest>): Promise<{
    travelDeskFlightRequest: TravelDeskFlightRequest
  }> {
    const { data } = await http.post("/api/travel-desk-flight-requests", attributes)
    return data
  },

  async update(
    travelDeskFlightRequestId: number,
    attributes: Partial<TravelDeskFlightRequest>
  ): Promise<{
    travelDeskFlightRequest: TravelDeskFlightRequest
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-flight-requests/${travelDeskFlightRequestId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskFlightRequestId: number): Promise<void> {
    await http.delete(`/api/travel-desk-flight-requests/${travelDeskFlightRequestId}`)
  },
}

export default travelDeskFlightRequestsApi
