import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-travel-agency.ts */
export type TravelDeskTravelAgency = {
  id: number
  agencyName: string
  contactName: string | null
  contactEmail: string | null
  contactPhoneNumber: string | null
  agencyInfo: string | null
}

export type TravelDeskTravelAgencyWhereOptions = WhereOptions<
  TravelDeskTravelAgency,
  "id" | "agencyName" | "contactName" | "contactEmail" | "contactPhoneNumber"
>

/** must match model scopes */
export type TravelDeskTravelAgencyFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskTravelAgenciesQueryOptions = QueryOptions<
  TravelDeskTravelAgencyWhereOptions,
  TravelDeskTravelAgencyFiltersOptions
>

export const travelDeskTravelAgenciesApi = {
  async list(params: TravelDeskTravelAgenciesQueryOptions = {}): Promise<{
    travelDeskTravelAgencies: TravelDeskTravelAgency[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-travel-agencies", {
      params,
    })
    return data
  },

  async get(travelDeskTravelAgencyId: number): Promise<{
    travelDeskTravelAgency: TravelDeskTravelAgency
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-travel-agencies/${travelDeskTravelAgencyId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskTravelAgency>): Promise<{
    travelDeskTravelAgency: TravelDeskTravelAgency
  }> {
    const { data } = await http.post("/api/travel-desk-travel-agencies", attributes)
    return data
  },

  async update(
    travelDeskTravelAgencyId: number,
    attributes: Partial<TravelDeskTravelAgency>
  ): Promise<{
    travelDeskTravelAgency: TravelDeskTravelAgency
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-travel-agencies/${travelDeskTravelAgencyId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskTravelAgencyId: number): Promise<void> {
    await http.delete(`/api/travel-desk-travel-agencies/${travelDeskTravelAgencyId}`)
  },
}

export default travelDeskTravelAgenciesApi
