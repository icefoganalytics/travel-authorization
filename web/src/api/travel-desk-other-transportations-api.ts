import http from "@/api/http-client"
import { type FiltersOptions, type QueryOptions, type WhereOptions } from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-other-transportation.ts */
export enum TravelDeskOtherTransportationStatuses {
  REQUESTED = "Requested",
  RESERVED = "Reserved",
}

/** @deprecated - prefer enum equivalent `TravelDeskOtherTransportationStatuses` */
export const TRAVEL_DESK_OTHER_TRANSPORTATION_STATUSES = Object.freeze({
  REQUESTED: "Requested",
  RESERVED: "Reserved",
})

/** Keep in sync with api/src/models/travel-desk-other-transportation.ts */
export enum TravelDeskOtherTransportationTypes {
  SHUTTLE = "Shuttle",
  BUS = "Bus",
  TRAIN = "Train",
}

/** @deprecated - prefer enum equivalent `TravelDeskOtherTransportationTypes` */
export const TRANSPORTATION_TYPES = Object.freeze({
  SHUTTLE: "Shuttle",
  BUS: "Bus",
  TRAIN: "Train",
})

/** Keep in sync with api/src/models/travel-desk-other-transportation.ts */
export type TravelDeskOtherTransportation = {
  id: number
  travelRequestId: number
  depart: string
  arrive: string
  transportationType: string
  date: string
  additionalNotes: string | null
  status: string
  reservedTransportationInfo: string | null
  booking: string | null
  createdAt: string
  updatedAt: string
}

/** Keep in sync with api/src/serializers/travel-desk-other-transportations/index-serializer.ts */
export type TravelDeskOtherTransportationAsIndex = Pick<
  TravelDeskOtherTransportation,
  | "id"
  | "travelRequestId"
  | "depart"
  | "arrive"
  | "transportationType"
  | "date"
  | "additionalNotes"
  | "reservedTransportationInfo"
  | "booking"
  | "status"
  | "createdAt"
  | "updatedAt"
>

export type TravelDeskOtherTransportationAsShow = TravelDeskOtherTransportation

export type TravelDeskOtherTransportationWhereOptions = WhereOptions<
  TravelDeskOtherTransportation,
  "id" | "travelRequestId" | "depart" | "arrive" | "transportationType" | "date" | "status"
>

/** must match model scopes */
export type TravelDeskOtherTransportationFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskOtherTransportationsQueryOptions = QueryOptions<
  TravelDeskOtherTransportationWhereOptions,
  TravelDeskOtherTransportationFiltersOptions
>

export const travelDeskOtherTransportationsApi = {
  TravelDeskOtherTransportationStatuses,
  TravelDeskOtherTransportationTypes,
  TRAVEL_DESK_OTHER_TRANSPORTATION_STATUSES,
  TRANSPORTATION_TYPES,

  async list(params: TravelDeskOtherTransportationsQueryOptions = {}): Promise<{
    travelDeskOtherTransportations: TravelDeskOtherTransportationAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-other-transportations", {
      params,
    })
    return data
  },

  async get(
    travelDeskOtherTransportationId: number,
    params: Record<string, unknown> = {}
  ): Promise<{
    travelDeskOtherTransportation: TravelDeskOtherTransportationAsShow
  }> {
    const { data } = await http.get(
      `/api/travel-desk-other-transportations/${travelDeskOtherTransportationId}`,
      {
        params,
      }
    )
    return data
  },

  async create(attributes: Partial<TravelDeskOtherTransportation>): Promise<{
    travelDeskOtherTransportation: TravelDeskOtherTransportationAsShow
  }> {
    const { data } = await http.post("/api/travel-desk-other-transportations", attributes)
    return data
  },

  async update(
    travelDeskOtherTransportationId: number,
    attributes: Partial<TravelDeskOtherTransportation>
  ): Promise<{
    travelDeskOtherTransportation: TravelDeskOtherTransportationAsShow
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-other-transportations/${travelDeskOtherTransportationId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskOtherTransportationId: number): Promise<void> {
    const { data } = await http.delete(
      `/api/travel-desk-other-transportations/${travelDeskOtherTransportationId}`
    )
    return data
  },
}

export default travelDeskOtherTransportationsApi
