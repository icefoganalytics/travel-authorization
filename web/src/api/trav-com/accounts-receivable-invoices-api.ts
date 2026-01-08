import http from "@/api/http-client"

import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type AccountsReceivableInvoice = {
  id: number
  invoiceNumber: string
  profileNumber: string | null
  profileName: string | null
  departmentMailcode: string | null
  bookingDate: string | null
  systemDate: string | null
  description: string | null
  invoiceRemarks: string | null
}

export type AccountsReceivableInvoiceDetailAsReference = {
  id: number
  invoiceId: number
  transactionType: number
  vendorNumber: string
  vendorName: string
  productCode: number
  passengerName: string
  ticketNumber: string
  publishedFare: number
  sellingFare: number
  referenceFare: number
  lowFare: number
  tax1: number
  grossAmount: number
  commissionAmount: number
  vatOnCommission: number
  freeFieldA: string | null
  travelDate: string | null
  returnDate: string | null
  numberOfDays: number | null
  cityCode: string | null
  profileNumber: string | null
  addedBy: number
}

export type SegmentAsReference = {
  id: number
  invoiceId: number
  invoiceDetailId: number
  legNumber: number
  departureCityCode: string | null
  departureInfo: string | null
  arrivalCityCode: string | null
  arrivalInfo: string | null
  airlineCode: string | null
  flightNumber: string | null
  classOfService: string | null
  fareBasis: string | null
  departureCityName: string | null
  arrivalCityName: string | null
}

export type AccountsReceivableInvoiceAsIndex = AccountsReceivableInvoice

export type AccountsReceivableInvoiceAsShow = AccountsReceivableInvoice & {
  // computed fields
  totalCost: number
  // associations
  details: AccountsReceivableInvoiceDetailAsReference[]
  segments: SegmentAsReference[]
}

export type AccountsReceivableInvoiceWhereOptions = WhereOptions<
  AccountsReceivableInvoice,
  "id" | "invoiceNumber"
>

/** Add as needed, must match model scopes */
export type AccountsReceivableInvoiceFiltersOptions = FiltersOptions<Record<string, never>>

export type AccountsReceivableInvoiceQueryOptions = QueryOptions<
  AccountsReceivableInvoiceWhereOptions,
  AccountsReceivableInvoiceFiltersOptions
>

export const accountsReceivableInvoicesApi = {
  async list(params: AccountsReceivableInvoiceQueryOptions = {}): Promise<{
    accountsReceivableInvoices: AccountsReceivableInvoiceAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/trav-com/accounts-receivable-invoices", { params })
    return data
  },

  async get(accountsReceivableInvoiceId: number): Promise<{
    accountsReceivableInvoice: AccountsReceivableInvoiceAsShow
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/trav-com/accounts-receivable-invoices/${accountsReceivableInvoiceId}`
    )
    return data
  },
}

export default accountsReceivableInvoicesApi
