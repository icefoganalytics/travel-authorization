import http from "@/api/http-client"

import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

// Keep in sync with api/src/models/flight-reconciliation.ts
export type FlightReconciliation = {
  id: number
  reconcilerId: number
  externalTravComIdentifier: number
  invoiceBookingDate: string | null
  invoiceDepartmentMailcode: string | null
  invoiceDetailSellingFare: number
  invoiceDetailComputedAgentName: string | null
  invoiceDetailVendorName: string
  invoiceDetailComputedTravelerFirstName: string
  invoiceDetailComputedTravelerLastName: string
  segmentsComputedFlightInfo: string | null
  segmentsComputedFinalDestination: string | null
  reconciled: boolean
  reconcilePeriod: number | null
  createdAt: string
  updatedAt: string
}

export type FlightReconciliationAsIndex = FlightReconciliation

export type FlightReconciliationAsShow = FlightReconciliation

export type FlightReconciliationWhereOptions = WhereOptions<
  FlightReconciliation,
  "id" | "reconcilerId" | "externalTravComIdentifier" | "reconciled" | "reconcilePeriod"
>

// match with model scopes signatures
export type FlightReconciliationFiltersOptions = FiltersOptions<{
  invoiceBookingDateBetween: [string, string]
}>

export type FlightReconciliationsQueryOptions = QueryOptions<
  FlightReconciliationWhereOptions,
  FlightReconciliationFiltersOptions
>

export const flightReconciliationsApi = {
  async list(params: FlightReconciliationsQueryOptions = {}): Promise<{
    flightReconciliations: FlightReconciliationAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/flight-reconciliations", {
      params,
    })
    return data
  },

  async get(flightReconciliationId: number): Promise<{
    flightReconciliation: FlightReconciliationAsShow
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
    flightReconciliations: FlightReconciliationAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.post("/api/flight-reconciliations/sync", query)
    return data
  },
}

export default flightReconciliationsApi
