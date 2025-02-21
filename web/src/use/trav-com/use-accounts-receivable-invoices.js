import { reactive, toRefs, ref, unref, watch } from "vue"

import accountsReceivableInvoicesApi from "@/api/trav-com/accounts-receivable-invoices-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/trav-com/accounts-receivable-invoices-api.js').AccountsReceivableInvoice} AccountsReceivableInvoice */
/** @typedef {import('@/api/trav-com/accounts-receivable-invoices-api.js').AccountsReceivableInvoicesQueryOptions} AccountsReceivableInvoicesQueryOptions */

/**
 * Provides reactive state management for Trav Com AR invoices with API integration.
 *
 * @param {AccountsReceivableInvoicesQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching AR invoices.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   accountsReceivableInvoices: Ref<AccountsReceivableInvoice[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<AccountsReceivableInvoice[]>,
 *   refresh: () => Promise<AccountsReceivableInvoice[]>
 * }}
 */
export function useAccountsReceivableInvoices(
  options = ref({}),
  { skipWatchIf = () => false } = {}
) {
  const state = reactive({
    accountsReceivableInvoices: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { accountsReceivableInvoices, totalCount } = await accountsReceivableInvoicesApi.list(
        unref(options)
      )
      state.isErrored = false
      state.accountsReceivableInvoices = accountsReceivableInvoices
      state.totalCount = totalCount
      return accountsReceivableInvoices
    } catch (error) {
      console.error("Failed to fetch accounts receivable invoices:", error)
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

export default useAccountsReceivableInvoices
