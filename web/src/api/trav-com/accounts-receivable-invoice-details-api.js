import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * Keep in sync with api/src/integrations/trav-com-integration/models/accounts-receivable-invoice-detail.ts
 * @typedef {{
 *   id: number
 *   invoiceId: number
 *   transactionType: number
 *   vendorNumber: string
 *   vendorName: string
 *   productCode: number
 *   passengerName: string
 *   ticketNumber: string
 *   publishedFare: number
 *   sellingFare: number
 *   referenceFare: number
 *   lowFare: number
 *   tax1: number
 *   grossAmount: number
 *   commissionAmount: number
 *   vatOnCommission: number
 *   freeFieldA: string | null
 *   travelDate: string | null
 *   returnDate: string | null
 *   numberOfDays: number | null
 *   cityCode: string | null
 *   profileNumber: string | null
 *   addedBy: number
 * }} AccountsReceivableInvoiceDetail
 */

/**
 * @typedef {{
 *   id?: number;
 *   invoiceId?: number;
 *   transactionType?: number;
 *   vendorNumber?: string;
 *   productCode?: number;
 *   ticketNumber?: string;
 *   numberOfDays?: number;
 *   cityCode?: string;
 *   profileNumber?: string;
 *   addedBy?: number;
 * }} AccountsReceivableInvoiceDetailWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   invoiceBookingDateBetween?: [string, string];
 * }} AccountsReceivableInvoiceDetailFiltersOptions
 */

/**
 * @typedef {{
 *   where?: AccountsReceivableInvoiceDetailWhereOptions;
 *   filters?: AccountsReceivableInvoiceDetailFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} AccountsReceivableInvoiceDetailsQueryOptions
 */

export const accountsReceivableInvoiceDetailsApi = {
  /**
   * @param {AccountsReceivableInvoiceDetailsQueryOptions} [params={}]
   * @returns {Promise<{
   *   accountsReceivableInvoiceDetails: AccountsReceivableInvoiceDetail[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/trav-com/accounts-receivable-invoice-details", {
      params,
    })
    return data
  },

  /**
   * @param {number} accountsReceivableInvoiceDetailId
   * @returns {Promise<{
   *   accountsReceivableInvoiceDetail: AccountsReceivableInvoiceDetail;
   *   policy: Policy;
   * }>}
   */
  async get(accountsReceivableInvoiceDetailId) {
    const { data } = await http.get(
      `/api/trav-com/accounts-receivable-invoice-details/${accountsReceivableInvoiceDetailId}`
    )
    return data
  },
}

export default accountsReceivableInvoiceDetailsApi
