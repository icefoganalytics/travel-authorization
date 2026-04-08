import { reactive, toRefs, ref, unref, watch } from "vue"

import flightReconciliationsApi from "@/api/flight-reconciliations-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/flight-reconciliations-api.js').FlightReconciliation} FlightReconciliation */
/** @typedef {import('@/api/flight-reconciliations-api.js').FlightReconciliationsQueryOptions} FlightReconciliationsQueryOptions */

/**
 * Provides reactive state management for flight reconciliations with API integration.
 *
 * @param {Ref<FlightReconciliationsQueryOptions>} [options=ref({})] - Configuration options containing filters and pagination settings for fetching flight reconciliations.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   flightReconciliations: Ref<FlightReconciliation[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<FlightReconciliation[]>,
 *   refresh: () => Promise<FlightReconciliation[]>
 * }}
 */
export function useFlightReconciliations(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    flightReconciliations: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { flightReconciliations, totalCount } = await flightReconciliationsApi.list(
        unref(options)
      )
      state.isErrored = false
      state.flightReconciliations = flightReconciliations
      state.totalCount = totalCount
      return flightReconciliations
    } catch (error) {
      console.error("Failed to fetch flight reconciliations:", error)
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

export default useFlightReconciliations
