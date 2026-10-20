import { isCancel } from "axios"
import { onScopeDispose, reactive, toRefs, ref, unref, watch } from "vue"

import travelDeskFlightOptionsApi from "@/api/travel-desk-flight-options-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-desk-flight-options-api.js').TravelDeskFlightOption} TravelDeskFlightOption */
/** @typedef {import('@/api/travel-desk-flight-options-api.js').TravelDeskFlightOptionsQueryOptions} TravelDeskFlightOptionsQueryOptions */

/**
 * Provides reactive state management for travel desk flight options with API integration.
 *
 * @param {TravelDeskFlightOptionsQueryOptions | Ref<TravelDeskFlightOptionsQueryOptions>} [options=ref({})] - Configuration options containing filters and pagination settings for fetching travel desk flight options.
 * @param {Object} [{ skipWatchIf = () => false }={}] - Configuration to conditionally skip API calls.
 * @param {Function} [skipWatchIf] - Function that returns a boolean to determine if fetching should be skipped.
 * @returns {{
 *   travelDeskFlightOptions: Ref<TravelDeskFlightOption[]>,
 *   totalCount: Ref<number>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelDeskFlightOption[]>,
 *   refresh: () => Promise<TravelDeskFlightOption[]>
 * }}
 */
export function useTravelDeskFlightOptions(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    travelDeskFlightOptions: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  let requestController

  async function fetch() {
    requestController?.abort()
    const controller = new AbortController()
    requestController = controller

    state.isLoading = true
    try {
      const { travelDeskFlightOptions, totalCount } = await travelDeskFlightOptionsApi.list(
        unref(options),
        { signal: controller.signal }
      )
      if (controller.signal.aborted) {
        return state.travelDeskFlightOptions
      }

      state.isErrored = false
      state.travelDeskFlightOptions = travelDeskFlightOptions
      state.totalCount = totalCount
      return travelDeskFlightOptions
    } catch (error) {
      if (controller.signal.aborted) {
        return state.travelDeskFlightOptions
      }

      if (isCancel(error)) {
        state.isErrored = false
        return state.travelDeskFlightOptions
      }

      console.error("Failed to fetch travel desk flight options:", error)
      state.isErrored = true
      throw error
    } finally {
      // A superseded request must not hide its replacement's loading state.
      if (!controller.signal.aborted) {
        state.isLoading = false
      }
    }
  }

  watch(
    () => [skipWatchIf(), unref(options)],
    async ([skip]) => {
      if (skip) {
        requestController?.abort()
        state.isLoading = false
        return
      }

      await fetch()
    },
    { deep: true, immediate: true }
  )

  onScopeDispose(() => {
    requestController?.abort()
  })

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTravelDeskFlightOptions
