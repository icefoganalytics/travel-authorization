import { type Ref, reactive, toRefs, ref, unref, watch } from "vue"

import travelDeskTravelRequestsApi, {
  type TravelDeskTravelRequestAsIndex,
  type TravelDeskTravelRequestsQueryOptions,
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

export {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
  TravelDeskTravelRequestStatuses,
  type TravelDeskTravelRequestAsIndex,
  type TravelDeskTravelRequestsQueryOptions,
}

/**
 * Provides reactive state management for travel desk travel requests with API integration.
 */
export function useTravelDeskTravelRequests(
  options: Ref<TravelDeskTravelRequestsQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
): {
  travelDeskTravelRequests: Ref<TravelDeskTravelRequestAsIndex[]>
  totalCount: Ref<number>
  isLoading: Ref<boolean>
  isErrored: Ref<boolean>
  fetch: () => Promise<TravelDeskTravelRequestAsIndex[]>
  refresh: () => Promise<TravelDeskTravelRequestAsIndex[]>
} {
  const state = reactive<{
    travelDeskTravelRequests: TravelDeskTravelRequestAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskTravelRequests: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskTravelRequestAsIndex[]> {
    state.isLoading = true
    try {
      const { travelDeskTravelRequests, totalCount } = await travelDeskTravelRequestsApi.list(
        unref(options)
      )
      state.isErrored = false
      state.travelDeskTravelRequests = travelDeskTravelRequests
      state.totalCount = totalCount
      return travelDeskTravelRequests
    } catch (error) {
      console.error(`Failed to fetch travel desk travel requests: ${error}`, { error })
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

export default useTravelDeskTravelRequests
