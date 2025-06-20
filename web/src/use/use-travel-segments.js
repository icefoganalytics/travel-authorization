import { reactive, toRefs, ref, unref, watch } from "vue"

import travelSegmentsApi, { TRAVEL_METHODS, ACCOMMODATION_TYPES } from "@/api/travel-segments-api"

export { TRAVEL_METHODS, ACCOMMODATION_TYPES }

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-segments-api.js').TravelSegment} TravelSegment */
/** @typedef {import('@/api/travel-segments-api.js').TravelSegmentsQueryOptions} TravelSegmentsQueryOptions */

/**
 * Provides reactive state management for travel segments with API integration.
 *
 * @param {TravelSegmentsQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching travel segments.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   travelSegments: Ref<TravelSegment[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   isInitialized: Ref<boolean>,
 *   fetch: () => Promise<TravelSegment[]>,
 *   refresh: () => Promise<TravelSegment[]>,
 *   isReady: () => Promise<boolean>,
 * }}
 */
export function useTravelSegments(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    travelSegments: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
    isInitialized: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelSegments, totalCount } = await travelSegmentsApi.list(unref(options))
      state.isErrored = false
      state.travelSegments = travelSegments
      state.totalCount = totalCount
      return travelSegments
    } catch (error) {
      console.error("Failed to fetch travel segments:", error)
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
      state.isInitialized = true
    },
    { deep: true, immediate: true }
  )

  async function isReady() {
    return new Promise((resolve) => {
      if (state.isInitialized) {
        resolve(true)
      } else {
        const interval = setInterval(() => {
          if (state.isErrored) {
            clearInterval(interval)
            return resolve(false)
          } else if (state.isInitialized && !state.isLoading) {
            clearInterval(interval)
            return resolve(true)
          }
        }, 10)
      }
    })
  }

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    isReady,
  }
}

export default useTravelSegments
