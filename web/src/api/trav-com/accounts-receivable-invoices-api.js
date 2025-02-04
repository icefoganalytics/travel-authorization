import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

/**
 * Keep in sync with api/src/integrations/trav-com-integration/models/accounts-receivable-invoice.ts
 * @typedef {{
 *   id: number;
 *   invoiceNumber: string;
 *   profileNumber: string | null;
 *   profileName: string | null;
 *   department: string | null;
 *   bookingDate: string | null;
 *   systemDate: string | null;
 *   description: string | null;
 *   invoiceRemarks: string | null;
 * }} AccountsReceivableInvoice
 */

/**
 * @typedef {{
 *   id?: number;
 *   invoiceNumber?: string;
 *   profileNumber?: string | null;
 *   profileName?: string | null;
 *   department?: string | null;
 *   bookingDate?: string | null;
 *   systemDate?: string | null;
 *   description?: string | null;
 *   invoiceRemarks?: string | null;
 * }} AccountsReceivableInvoiceWhereOptions
 */

/**
 * // match with model scopes signatures
 * @typedef {{
 *   bookingDateBetween?: [string, string];
 * }} AccountsReceivableInvoiceFiltersOptions
 */

/**
 * @typedef {{
 *   where?: AccountsReceivableInvoiceWhereOptions;
 *   filters?: AccountsReceivableInvoiceFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} AccountsReceivableInvoicesQueryOptions
 */

export const accountsReceivableInvoicesApi = {
  /**
   * @param {AccountsReceivableInvoicesQueryOptions} [params={}]
   * @returns {Promise<{
   *   accountsReceivableInvoices: AccountsReceivableInvoice[];
   *   totalCount: number;
   * }>}
   */
  async list(params = {}) {
    const { data } = await http.get("/api/trav-com/accounts-receivable-invoices", {
      params,
    })
    return data
  },

  /**
   * @param {number} accountsReceivableInvoiceId
   * @returns {Promise<{
   *   accountsReceivableInvoice: AccountsReceivableInvoice;
   *   policy: Policy;
   * }>}
   */
  async get(accountsReceivableInvoiceId) {
    const { data } = await http.get(
      `/api/trav-com/accounts-receivable-invoices/${accountsReceivableInvoiceId}`
    )
    return data
  },
}

export default accountsReceivableInvoicesApi
