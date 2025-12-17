import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-travel-request.ts */
export enum TravelDeskTravelRequestStatuses {
  BOOKED = "booked",
  COMPLETE = "complete",
  DRAFT = "draft",
  OPTIONS_PROVIDED = "options_provided",
  OPTIONS_RANKED = "options_ranked",
  SUBMITTED = "submitted",
}

/** @deprecated - prefer enum equivalent `TravelDeskTravelRequestStatuses` */
export const TRAVEL_DESK_TRAVEL_REQUEST_STATUSES = Object.freeze({
  BOOKED: "booked",
  COMPLETE: "complete",
  DRAFT: "draft",
  OPTIONS_PROVIDED: "options_provided",
  OPTIONS_RANKED: "options_ranked",
  SUBMITTED: "submitted",
})

/** Keep in sync with api/src/models/travel-desk-travel-request.ts */
export type TravelDeskTravelRequest = {
  id: number
  travelAuthorizationId: number
  travelAgencyId: number | null
  legalFirstName: string
  legalMiddleName: string | null
  legalLastName: string
  birthDate: string | null
  strAddress: string
  city: string
  province: string
  postalCode: string
  passportCountry: string | null
  passportNum: string | null
  travelPurpose: string
  travelLocation: string | null
  travelNotes: string | null
  busPhone: string
  busEmail: string
  travelContact: boolean | null
  travelPhone: string | null
  travelEmail: string | null
  additionalInformation: string | null
  status: TravelDeskTravelRequestStatuses
  travelDeskOfficer: string | null
  isInternationalTravel: boolean
  createdAt: string
  updatedAt: string
}

export type TravelDeskTravelRequestAsIndex = TravelDeskTravelRequest & {
  userDisplayName: string
  department: string
  branch: string
  travelStartDate: string
  travelEndDate: string
  locationsTraveled: string
  requestedOptions: string
}

export type TravelDeskTravelRequestAsReference = Pick<
  TravelDeskTravelRequest,
  | "id"
  | "travelAuthorizationId"
  | "travelAgencyId"
  | "legalFirstName"
  | "legalLastName"
  | "strAddress"
  | "city"
  | "province"
  | "postalCode"
  | "legalMiddleName"
  | "travelPurpose"
  | "busPhone"
  | "busEmail"
  | "status"
  | "birthDate"
  | "isInternationalTravel"
  | "passportCountry"
  | "passportNum"
  | "travelLocation"
  | "travelNotes"
  | "travelContact"
  | "travelPhone"
  | "travelEmail"
  | "additionalInformation"
  | "travelDeskOfficer"
  | "createdAt"
  | "updatedAt"
>

export type TravelDeskTravelRequestWhereOptions = WhereOptions<
  TravelDeskTravelRequest,
  | "id"
  | "travelAuthorizationId"
  | "travelAgencyId"
  | "status"
  | "travelContact"
  | "isInternationalTravel"
>

/** must match model scopes */
export type TravelDeskTravelRequestFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskTravelRequestsQueryOptions = QueryOptions<
  TravelDeskTravelRequestWhereOptions,
  TravelDeskTravelRequestFiltersOptions
>

export const travelDeskTravelRequestsApi = {
  async list(params: TravelDeskTravelRequestsQueryOptions = {}): Promise<{
    travelDeskTravelRequests: TravelDeskTravelRequestAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-travel-requests", {
      params,
    })
    return data
  },

  async get(
    travelDeskTravelRequestId: number,
    params: Record<string, unknown> = {}
  ): Promise<{
    travelDeskTravelRequest: TravelDeskTravelRequest
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}`,
      { params }
    )
    return data
  },

  async update(
    travelDeskTravelRequestId: number,
    attributes: Partial<TravelDeskTravelRequest>
  ): Promise<{
    travelDeskTravelRequest: TravelDeskTravelRequest
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}`,
      attributes
    )
    return data
  },

  // Stateful Actions
  async submit(
    travelDeskTravelRequestId: number,
    attributes?: Partial<TravelDeskTravelRequest>
  ): Promise<{
    travelDeskTravelRequest: TravelDeskTravelRequest
  }> {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/submit`,
      attributes
    )
    return data
  },

  async optionsProvided(
    travelDeskTravelRequestId: number,
    attributes: Partial<TravelDeskTravelRequest>
  ): Promise<{
    travelDeskTravelRequest: TravelDeskTravelRequest
  }> {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/options-provided`,
      attributes
    )
    return data
  },

  async optionsRanked(travelDeskTravelRequestId: number): Promise<{
    travelDeskTravelRequest: TravelDeskTravelRequest
  }> {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/options-ranked`
    )
    return data
  },

  async book(
    travelDeskTravelRequestId: number,
    attributes: Partial<TravelDeskTravelRequest>
  ): Promise<{
    travelDeskTravelRequest: TravelDeskTravelRequest
  }> {
    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/book`,
      attributes
    )
    return data
  },
}

export default travelDeskTravelRequestsApi
