import { reactive, toRefs, unref, watch, ref } from "vue"

import travelDeskHotelsApi, {
  type TravelDeskHotelAsIndex,
  type TravelDeskHotelWhereOptions,
  type TravelDeskHotelFiltersOptions,
  type TravelDeskHotelsQueryOptions,
  TRAVEL_DESK_HOTEL_STATUSES,
} from "@/api/travel-desk-hotels-api"

export {
  type TravelDeskHotelAsIndex,
  type TravelDeskHotelWhereOptions,
  type TravelDeskHotelFiltersOptions,
  type TravelDeskHotelsQueryOptions,
  TRAVEL_DESK_HOTEL_STATUSES,
}

/**
 * Provides reactive state management for travelDeskHotels with API integration.
 */
export function useTravelDeskHotels(
  options = ref<TravelDeskHotelsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelDeskHotels: TravelDeskHotelAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskHotels: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskHotelAsIndex[]> {
    state.isLoading = true
    try {
      const { travelDeskHotels, totalCount } = await travelDeskHotelsApi.list(unref(options))
      state.isErrored = false
      state.travelDeskHotels = travelDeskHotels
      state.totalCount = totalCount
      return travelDeskHotels
    } catch (error) {
      console.error(`Failed to fetch travelDeskHotels: ${error}`, { error })
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

export default useTravelDeskHotels
