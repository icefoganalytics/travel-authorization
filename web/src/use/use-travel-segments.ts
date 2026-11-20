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

  let latestRequest = 0

  async function fetch() {
    const request = ++latestRequest
    const query = unref(options)
    state.isInitialized = false
    state.isErrored = false
    state.isLoading = true
    try {
      const { travelSegments, totalCount } = await travelSegmentsApi.list(query)
      if (query.perPage === -1) {
        let page = 1
        while (travelSegments.length < totalCount && request === latestRequest) {
          page++
          const nextPage = await travelSegmentsApi.list({ ...query, page })
          if (nextPage.travelSegments.length === 0 || nextPage.totalCount !== totalCount) {
            throw new Error("The itinerary changed while loading. Try again.")
          }
          travelSegments.push(...nextPage.travelSegments)
        }
      }
      if (request !== latestRequest) return travelSegments

      state.isInitialized = true
      state.travelSegments = travelSegments
      state.totalCount = totalCount
      return travelSegments
    } catch (error) {
      if (request !== latestRequest) throw error
      console.error(`Failed to fetch travel segments: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      if (request === latestRequest) {
        state.isLoading = false
      }
    }
  }

  watch(
    () => [skipWatchIf(), unref(options)],
    async ([skip], _previous, onCleanup) => {
      if (skip) return

      onCleanup(() => {
        latestRequest++
        state.isInitialized = false
        state.isLoading = false
      })
      try {
        await fetch()
      } catch {
        // Automatic loads expose the error through isErrored; explicit fetch calls reject.
      }
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
