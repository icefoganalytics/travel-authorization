import http from "@/api/http-client"

import { type FiltersOptions, type QueryOptions, type WhereOptions } from "@/api/base-api"

/** Keep in sync with api/src/integrations/trav-com-integration/models/accounts-receivable-invoice-detail.ts */
export type AccountsReceivableInvoiceDetail = {
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

export type AccountsReceivableInvoiceDetailAsReference = Pick<
  AccountsReceivableInvoiceDetail,
  | "id"
  | "invoiceId"
  | "transactionType"
  | "vendorNumber"
  | "vendorName"
  | "productCode"
  | "passengerName"
  | "ticketNumber"
  | "publishedFare"
  | "sellingFare"
  | "referenceFare"
  | "lowFare"
  | "tax1"
  | "grossAmount"
  | "commissionAmount"
  | "vatOnCommission"
  | "freeFieldA"
  | "travelDate"
  | "returnDate"
  | "numberOfDays"
  | "cityCode"
  | "profileNumber"
  | "addedBy"
>

export type AccountsReceivableInvoiceDetailWhereOptions = WhereOptions<
  AccountsReceivableInvoiceDetail,
  | "id"
  | "invoiceId"
  | "transactionType"
  | "vendorNumber"
  | "productCode"
  | "ticketNumber"
  | "numberOfDays"
  | "cityCode"
  | "profileNumber"
  | "addedBy"
>

/** Add as needed, must match model scopes */
export type AccountsReceivableInvoiceDetailFiltersOptions = FiltersOptions<{
  invoiceBookingDateBetween?: [string, string]
}>

export type AccountsReceivableInvoiceDetailsQueryOptions = QueryOptions<
  AccountsReceivableInvoiceDetailWhereOptions,
  AccountsReceivableInvoiceDetailFiltersOptions
>

export const accountsReceivableInvoiceDetailsApi = {
  async list(params: AccountsReceivableInvoiceDetailsQueryOptions = {}): Promise<{
    accountsReceivableInvoiceDetails: AccountsReceivableInvoiceDetail[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/trav-com/accounts-receivable-invoice-details", {
      params,
    })
    return data
  },
}

export default accountsReceivableInvoiceDetailsApi
