import { reactive, toRefs, ref, unref, watch } from "vue"

import arInvoiceDetailsApi from "@/api/trav-com/ar-invoice-details-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/trav-com/ar-invoice-details-api.js').ArInvoiceDetail} ArInvoiceDetail */
/** @typedef {import('@/api/trav-com/ar-invoice-details-api.js').ArInvoiceDetailsQueryOptions} ArInvoiceDetailsQueryOptions */

/**
 * Provides reactive state management for Trav Com AR invoices with API integration.
 *
 * @param {ArInvoiceDetailsQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching AR invoices.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   arInvoiceDetails: Ref<ArInvoiceDetail[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<ArInvoiceDetail[]>,
 *   refresh: () => Promise<ArInvoiceDetail[]>
 * }}
 */
export function useArInvoiceDetails(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    arInvoiceDetails: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { arInvoiceDetails, totalCount } = await arInvoiceDetailsApi.list(unref(options))
      state.isErrored = false
      state.arInvoiceDetails = arInvoiceDetails
      state.totalCount = totalCount
      return arInvoiceDetails
    } catch (error) {
      console.error("Failed to fetch AR invoice details:", error)
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

export default useArInvoiceDetails
