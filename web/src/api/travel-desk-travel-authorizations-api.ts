import http from "@/api/http-client"
import { type FiltersOptions, type QueryOptions, type WhereOptions } from "@/api/base-api"

import { type TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"
import { type TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"

export type TravelDeskTravelAuthorization = {
  id: number
  firstName: string | null
  lastName: string | null
  status: TravelAuthorizationStatuses
  purposeText: string
  departingAt: string | null
  returningAt: string | null
  locationIds: number[]
  travelDeskTravelRequest: {
    id: number
    status: TravelDeskTravelRequestStatuses
    invoiceNumber: string | null
  } | null
}

export type TravelDeskTravelAuthorizationWhereOptions = WhereOptions<
  TravelDeskTravelAuthorization,
  "id" | "status"
>

export type TravelDeskTravelAuthorizationsQueryOptions = QueryOptions<
  TravelDeskTravelAuthorizationWhereOptions,
  FiltersOptions<Record<never, never>>
>

export const travelDeskTravelAuthorizationsApi = {
  async list(params: TravelDeskTravelAuthorizationsQueryOptions = {}) {
    const { data } = await http.get<{
      travelAuthorizations: TravelDeskTravelAuthorization[]
      totalCount: number
    }>("/api/travel-desk/travel-authorizations", { params })

    return data
  },
}

export default travelDeskTravelAuthorizationsApi
