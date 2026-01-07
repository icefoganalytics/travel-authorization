import { type ComputedRef, type Ref, computed, reactive, toRefs, ref, unref, watch } from "vue"

import travelDeskFlightRequestsApi, {
  type TravelDeskFlightRequest,
  type TravelDeskFlightRequestWhereOptions,
  type TravelDeskFlightRequestFiltersOptions,
  type TravelDeskFlightRequestsQueryOptions,
  TravelDeskFlightRequestSeatPreferenceTypes,
  TravelDeskFlightRequestTimePreferences,
} from "@/api/travel-desk-flight-requests-api"

export {
  type TravelDeskFlightRequest,
  type TravelDeskFlightRequestWhereOptions,
  type TravelDeskFlightRequestFiltersOptions,
  type TravelDeskFlightRequestsQueryOptions,
  TravelDeskFlightRequestSeatPreferenceTypes,
  TravelDeskFlightRequestTimePreferences,
}

/**
 * Provides reactive state management for travelDeskFlightRequests with API integration.
 */
export function useTravelDeskFlightRequests(
  options: Ref<TravelDeskFlightRequestsQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
): {
  travelDeskFlightRequests: Ref<TravelDeskFlightRequest[]>
  totalCount: Ref<number>
  isLoading: Ref<boolean>
  isErrored: Ref<boolean>
  earliestFlightDate: ComputedRef<string | null>
  latestFlightDate: ComputedRef<string | null>
  fetch: () => Promise<TravelDeskFlightRequest[]>
  refresh: () => Promise<TravelDeskFlightRequest[]>
} {
  const state = reactive<{
    travelDeskFlightRequests: TravelDeskFlightRequest[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskFlightRequests: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskFlightRequest[]> {
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
      console.error(`Failed to fetch travel desk flight requests: ${error}`, { error })
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
  const earliestFlightDate = computed<string | null>(() => {
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
  const latestFlightDate = computed<string | null>(() => {
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
