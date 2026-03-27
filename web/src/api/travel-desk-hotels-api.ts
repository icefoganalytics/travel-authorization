import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-hotel.ts */
export enum TravelDeskHotelStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/** @deprecated - prefer enum equivalent `TravelDeskHotelStatuses` */
export const TRAVEL_DESK_HOTEL_STATUSES = Object.freeze({
  REQUESTED: "Requested",
  RESERVED: "Reserved",
})

/** Keep in sync with api/src/models/travel-desk-hotel.ts */
export type TravelDeskHotel = {
  id: number
  travelRequestId: number
  city: string
  isDedicatedConferenceHotelAvailable: boolean
  conferenceName: string | null
  conferenceHotelName: string | null
  checkIn: string
  checkOut: string
  additionalInformation: string | null
  status: string
  reservedHotelInfo: string | null
  booking: string | null
  createdAt: string
  updatedAt: string
}

export type TravelDeskHotelAsIndex = Pick<
  TravelDeskHotel,
  | "id"
  | "travelRequestId"
  | "city"
  | "isDedicatedConferenceHotelAvailable"
  | "conferenceName"
  | "conferenceHotelName"
  | "checkIn"
  | "checkOut"
  | "additionalInformation"
  | "status"
  | "reservedHotelInfo"
  | "booking"
  | "createdAt"
  | "updatedAt"
>

export type TravelDeskHotelAsShow = TravelDeskHotel

export type TravelDeskHotelPolicy = Policy

export type TravelDeskHotelWhereOptions = WhereOptions<
  TravelDeskHotel,
  "id" | "travelRequestId" | "city" | "isDedicatedConferenceHotelAvailable" | "status"
>

/** must match model scopes */
export type TravelDeskHotelFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskHotelsQueryOptions = QueryOptions<
  TravelDeskHotelWhereOptions,
  TravelDeskHotelFiltersOptions
>

export const travelDeskHotelsApi = {
  TravelDeskHotelStatuses,
  TRAVEL_DESK_HOTEL_STATUSES,

  async list(params: TravelDeskHotelsQueryOptions = {}): Promise<{
    travelDeskHotels: TravelDeskHotelAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-hotels", { params })
    return data
  },

  async get(travelDeskHotelId: number): Promise<{
    travelDeskHotel: TravelDeskHotelAsShow
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-hotels/${travelDeskHotelId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskHotel>): Promise<{
    travelDeskHotel: TravelDeskHotelAsShow
    policy: Policy
  }> {
    const { data } = await http.post("/api/travel-desk-hotels", attributes)
    return data
  },

  async update(
    travelDeskHotelId: number,
    attributes: Partial<TravelDeskHotel>
  ): Promise<{
    travelDeskHotel: TravelDeskHotelAsShow
    policy: Policy
  }> {
    const { data } = await http.patch(`/api/travel-desk-hotels/${travelDeskHotelId}`, attributes)
    return data
  },

  async delete(travelDeskHotelId: number): Promise<void> {
    const { data } = await http.delete(`/api/travel-desk-hotels/${travelDeskHotelId}`)
    return data
  },
}

export default travelDeskHotelsApi
