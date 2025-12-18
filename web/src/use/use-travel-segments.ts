import { reactive, toRefs, ref, unref, watch } from "vue"

import travelSegmentsApi, {
  TravelSegmentTravelMethods,
  TravelSegmentAccommodationTypes,
  TRAVEL_METHODS,
  ACCOMMODATION_TYPES,
  type TravelSegmentAsIndex,
  type TravelSegmentWhereOptions,
  type TravelSegmentFiltersOptions,
  type TravelSegmentsQueryOptions,
} from "@/api/travel-segments-api"

export {
  TravelSegmentTravelMethods,
  TravelSegmentAccommodationTypes,
  ACCOMMODATION_TYPES,
  TRAVEL_METHODS,
  type TravelSegmentAsIndex,
  type TravelSegmentFiltersOptions,
  type TravelSegmentWhereOptions,
  type TravelSegmentsQueryOptions,
}

export function useTravelSegments(
  options = ref<TravelSegmentsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelSegments: TravelSegmentAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
    isInitialized: boolean
  }>({
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
      console.error(`Failed to fetch travel segments: ${error}`, { error })
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
