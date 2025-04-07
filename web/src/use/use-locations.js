import { reactive, toRefs, ref, unref, watch } from "vue"

import locationsApi from "@/api/locations-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/locations-api.js').Location} Location */
/** @typedef {import('@/api/locations-api.js').LocationsQueryOptions} LocationsQueryOptions */

/**
 * Provides reactive state management for locations with API integration.
 *
 * @param {LocationsQueryOptions} [options=ref({})] - Configuration options containing filters and pagination settings for fetching locations.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   locations: Ref<Location[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<Location[]>,
 *   refresh: () => Promise<Location[]>
 * }}
 */
export function useLocations(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    locations: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { locations, totalCount } = await locationsApi.list(unref(options))
      state.isErrored = false
      state.locations = locations
      state.totalCount = totalCount
      return locations
    } catch (error) {
      console.error("Failed to fetch locations:", error)
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

export default useLocations
