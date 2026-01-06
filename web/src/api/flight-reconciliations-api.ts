import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/flight-reconciliation.ts */
export type FlightReconciliation = {
  id: number
  reconcilerId: number
  externalTravComIdentifier: number
  reconciled: boolean
  reconcilePeriod: number | null
  createdAt: string
  updatedAt: string
}

export type FlightReconciliationWhereOptions = WhereOptions<
  FlightReconciliation,
  "id" | "reconcilerId" | "externalTravComIdentifier" | "reconciled" | "reconcilePeriod"
>

/** must match model scopes */
export type FlightReconciliationFiltersOptions = FiltersOptions<{
  invoiceBookingDateBetween: [string, string]
}>

export type FlightReconciliationsQueryOptions = QueryOptions<
  FlightReconciliationWhereOptions,
  FlightReconciliationFiltersOptions
>

export const flightReconciliationsApi = {
  async list(params: FlightReconciliationsQueryOptions = {}): Promise<{
    flightReconciliations: FlightReconciliation[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/flight-reconciliations", {
      params,
    })
    return data
  },

  async get(flightReconciliationId: number): Promise<{
    flightReconciliation: FlightReconciliation
    policy: Policy
  }> {
    const { data } = await http.get(`/api/flight-reconciliations/${flightReconciliationId}`)
    return data
  },

  async update(
    flightReconciliationId: number,
    attributes: Partial<FlightReconciliation>
  ): Promise<{
    flightReconciliation: FlightReconciliation
  }> {
    const { data } = await http.patch(
      `/api/flight-reconciliations/${flightReconciliationId}`,
      attributes
    )
    return data
  },

  async delete(flightReconciliationId: number): Promise<void> {
    await http.delete(`/api/flight-reconciliations/${flightReconciliationId}`)
  },

  // Special actions
  async sync(query: FlightReconciliationsQueryOptions = {}): Promise<{
    flightReconciliations: FlightReconciliation[]
    totalCount: number
  }> {
    const { data } = await http.post("/api/flight-reconciliations/sync", query)
    return data
  },
}

export default flightReconciliationsApi
