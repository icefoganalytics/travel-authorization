import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export const DOES_NOT_WORK = 0

/** Keep in sync with api/src/models/travel-desk-flight-option.ts */
export type TravelDeskFlightOption = {
  id: number
  flightRequestId: number
  travelerId: number
  cost: string
  leg: string
  duration: string
  flightPreferenceOrder: string | null
  additionalInformation: string | null
  createdAt: string
  updatedAt: string
}

export type TravelDeskFlightOptionWhereOptions = WhereOptions<
  TravelDeskFlightOption,
  "id" | "flightRequestId" | "travelerId" | "leg" | "flightPreferenceOrder"
>

/** must match model scopes */
export type TravelDeskFlightOptionFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskFlightOptionsQueryOptions = QueryOptions<
  TravelDeskFlightOptionWhereOptions,
  TravelDeskFlightOptionFiltersOptions
>

export const travelDeskFlightOptionsApi = {
  async list(params: TravelDeskFlightOptionsQueryOptions = {}): Promise<{
    travelDeskFlightOptions: TravelDeskFlightOption[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-flight-options", {
      params,
    })
    return data
  },

  async get(travelDeskFlightOptionId: number): Promise<{
    travelDeskFlightOption: TravelDeskFlightOption
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-flight-options/${travelDeskFlightOptionId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskFlightOption>): Promise<{
    travelDeskFlightOption: TravelDeskFlightOption
  }> {
    const { data } = await http.post("/api/travel-desk-flight-options", attributes)
    return data
  },

  async update(
    travelDeskFlightOptionId: number,
    attributes: Partial<TravelDeskFlightOption>
  ): Promise<{
    travelDeskFlightOption: TravelDeskFlightOption
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-flight-options/${travelDeskFlightOptionId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskFlightOptionId: number): Promise<void> {
    await http.delete(`/api/travel-desk-flight-options/${travelDeskFlightOptionId}`)
  },
}

export default travelDeskFlightOptionsApi
