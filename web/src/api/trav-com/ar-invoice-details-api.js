import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * Keep in sync with api/src/integrations/trav-com-integration/models/ar-invoice-detail.ts
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
 * }} ArInvoiceDetail
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
 * }} ArInvoiceDetailWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   invoiceBookingDateBetween?: [string, string];
 * }} ArInvoiceDetailFiltersOptions
 */

/**
 * @typedef {{
 *   where?: ArInvoiceDetailWhereOptions;
 *   filters?: ArInvoiceDetailFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} ArInvoiceDetailsQueryOptions
 */

export const arInvoiceDetailsApi = {
  /**
   * @param {ArInvoiceDetailsQueryOptions} [params={}]
   * @returns {Promise<{
   *   arInvoiceDetails: ArInvoiceDetail[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/trav-com/ar-invoice-details", {
      params,
    })
    return data
  },

  /**
   * @param {number} arInvoiceDetailId
   * @returns {Promise<{
   *   arInvoiceDetail: ArInvoiceDetail;
   *   policy: Policy;
   * }>}
   */
  async get(arInvoiceDetailId) {
    const { data } = await http.get(`/api/trav-com/ar-invoice-details/${arInvoiceDetailId}`)
    return data
  },
}

export default arInvoiceDetailsApi
