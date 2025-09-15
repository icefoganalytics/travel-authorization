import http from "@/api/http-client"

import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type GeneralLedgerCoding = {
  id: number
  travelAuthorizationId: number
  code: string
  amount: number
  createdAt: string
  updatedAt: string
}

export type GeneralLedgerCodingWhereOptions = WhereOptions<
  GeneralLedgerCoding,
  "id" | "travelAuthorizationId" | "code"
>

export type GeneralLedgerCodingFiltersOptions = FiltersOptions<Record<never, never>>

export type GeneralLedgerCodingQueryOptions = QueryOptions<
  GeneralLedgerCodingWhereOptions,
  GeneralLedgerCodingFiltersOptions
>

export const generalLedgerCodingsApi = {
  async list(params: GeneralLedgerCodingQueryOptions = {}): Promise<{
    generalLedgerCodings: GeneralLedgerCoding[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/general-ledger-codings", { params })
    return data
  },
  async create(attributes: Partial<GeneralLedgerCoding>): Promise<{
    generalLedgerCoding: GeneralLedgerCoding
  }> {
    const { data } = await http.post("/api/general-ledger-codings", attributes)
    return data
  },
  async update(
    generalLedgerCodingId: number,
    attributes: Partial<GeneralLedgerCoding>
  ): Promise<{
    generalLedgerCoding: GeneralLedgerCoding
    policy: Policy
  }> {
    const { data } = await http.patch(
      `/api/general-ledger-codings/${generalLedgerCodingId}`,
      attributes
    )
    return data
  },
  async delete(generalLedgerCodingId: number): Promise<void> {
    const { data } = await http.delete(`/api/general-ledger-codings/${generalLedgerCodingId}`)
    return data
  },
}

export default generalLedgerCodingsApi
