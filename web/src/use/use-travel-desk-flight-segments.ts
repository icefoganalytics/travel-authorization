import { reactive, toRefs, unref, watch, ref } from "vue"

import travelDeskFlightSegmentsApi, {
  type TravelDeskFlightSegmentAsIndex,
  type TravelDeskFlightSegment,
  type TravelDeskFlightSegmentWhereOptions,
  type TravelDeskFlightSegmentFiltersOptions,
  type TravelDeskFlightSegmentsQueryOptions,
} from "@/api/travel-desk-flight-segments-api"

export {
  type TravelDeskFlightSegmentAsIndex,
  type TravelDeskFlightSegment,
  type TravelDeskFlightSegmentWhereOptions,
  type TravelDeskFlightSegmentFiltersOptions,
  type TravelDeskFlightSegmentsQueryOptions,
}

export function useTravelDeskFlightSegments(
  options = ref<TravelDeskFlightSegmentsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelDeskFlightSegments: TravelDeskFlightSegmentAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskFlightSegments: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskFlightSegmentAsIndex[]> {
    state.isLoading = true
    try {
      const { travelDeskFlightSegments, totalCount } = await travelDeskFlightSegmentsApi.list(
        unref(options)
      )
      state.isErrored = false
      state.travelDeskFlightSegments = travelDeskFlightSegments
      state.totalCount = totalCount
      return state.travelDeskFlightSegments
    } catch (error) {
      console.error(`Failed to fetch travel desk flight segments: ${error}`, { error })
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

export default useTravelDeskFlightSegments
