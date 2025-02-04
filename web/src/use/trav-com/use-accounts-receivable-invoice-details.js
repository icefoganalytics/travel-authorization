import { reactive, toRefs, ref, unref, watch } from "vue"

import accountsReceivableInvoiceDetailsApi from "@/api/trav-com/accounts-receivable-invoice-details-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/trav-com/accounts-receivable-invoice-details-api.js').AccountsReceivableInvoiceDetail} AccountsReceivableInvoiceDetail */
/** @typedef {import('@/api/trav-com/accounts-receivable-invoice-details-api.js').AccountsReceivableInvoiceDetailsQueryOptions} AccountsReceivableInvoiceDetailsQueryOptions */

/**
 * Provides reactive state management for Trav Com AR invoices with API integration.
 *
 * @param {AccountsReceivableInvoiceDetailsQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching AR invoices.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   accountsReceivableInvoiceDetails: Ref<AccountsReceivableInvoiceDetail[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<AccountsReceivableInvoiceDetail[]>,
 *   refresh: () => Promise<AccountsReceivableInvoiceDetail[]>
 * }}
 */
export function useAccountsReceivableInvoiceDetails(
  options = ref({}),
  { skipWatchIf = () => false } = {}
) {
  const state = reactive({
    accountsReceivableInvoiceDetails: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { accountsReceivableInvoiceDetails, totalCount } =
        await accountsReceivableInvoiceDetailsApi.list(unref(options))
      state.isErrored = false
      state.accountsReceivableInvoiceDetails = accountsReceivableInvoiceDetails
      state.totalCount = totalCount
      return accountsReceivableInvoiceDetails
    } catch (error) {
      console.error("Failed to fetch accounts receivable invoice details:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => [skipWatchIf(), unref(options)],
    async ([skip]) => {
      if (skip) return

      await fetch()
    },
    { deep: true, immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useAccountsReceivableInvoiceDetails
