import { computed, reactive, toRefs, ref, unref, watch } from "vue"

import travelDeskFlightRequestsApi from "@/api/travel-desk-flight-requests-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-desk-flight-requests-api.js').TravelDeskFlightRequest} TravelDeskFlightRequest */
/** @typedef {import('@/api/travel-desk-flight-requests-api.js').TravelDeskFlightRequestsQueryOptions} TravelDeskFlightRequestsQueryOptions */

/**
 * Provides reactive state management for travelDeskFlightRequests with API integration.
 *
 * @param {Ref<TravelDeskFlightRequestsQueryOptions>} [options=ref({})] - Configuration options containing filters and pagination settings for fetching travelDeskFlightRequests.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   travelDeskFlightRequests: Ref<TravelDeskFlightRequest[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   earliestFlightDate: Ref<string | null>,
 *   latestFlightDate: Ref<string | null>,
 *   fetch: () => Promise<TravelDeskFlightRequest[]>,
 *   refresh: () => Promise<TravelDeskFlightRequest[]>
 * }}
 */
export function useTravelDeskFlightRequests(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    travelDeskFlightRequests: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelDeskFlightRequests, totalCount } = await travelDeskFlightRequestsApi.list(
        unref(options)
      )
      state.isErrored = false
      state.travelDeskFlightRequests = travelDeskFlightRequests
      state.totalCount = totalCount
      return travelDeskFlightRequests
    } catch (error) {
      console.error("Failed to fetch travel desk flight requests:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Assumes flights are returned in sorted order from back-end.
   * TODO: move to back-end to handle paginated date
   * Could use a special endpoint, or the ability to pass ordering to the back-end.
   */
  const earliestFlightDate = computed(() => {
    if (state.travelDeskFlightRequests.length > 0) {
      const earliestFlight = state.travelDeskFlightRequests[0]
      return earliestFlight.datePreference
    }

    return null
  })
  /**
   * Assumes flights are returned in sorted order from back-end.
   * TODO: move to back-end to handle paginated date
   * Could use a special endpoint, or the ability to pass ordering to the back-end.
   */
  const latestFlightDate = computed(() => {
    if (state.travelDeskFlightRequests.length > 1) {
      const latestFlight = state.travelDeskFlightRequests[state.travelDeskFlightRequests.length - 1]
      return latestFlight.datePreference
    }

    return null
  })

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
    earliestFlightDate,
    latestFlightDate,
    fetch,
    refresh: fetch,
  }
}

export default useTravelDeskFlightRequests
