import { type Ref, ref, reactive, toRefs, unref, watch } from "vue"

import flightStatisticsApi, {
  type FlightStatisticAsIndex,
  type FlightStatisticWhereOptions,
  type FlightStatisticFiltersOptions,
  type FlightStatisticQueryOptions,
} from "@/api/flight-statistics-api"

export {
  type FlightStatisticAsIndex,
  type FlightStatisticWhereOptions,
  type FlightStatisticFiltersOptions,
  type FlightStatisticQueryOptions,
}

/**
 * Fetches and manages flight statistics data based on the provided options.
 */
export function useFlightStatistics(
  options: Ref<FlightStatisticQueryOptions> = ref({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    flightStatistics: FlightStatisticAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    flightStatistics: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<FlightStatisticAsIndex[]> {
    state.isLoading = true
    try {
      const { flightStatistics, totalCount } = await flightStatisticsApi.list(unref(options))
      state.isErrored = false
      state.flightStatistics = flightStatistics
      state.totalCount = totalCount
      return flightStatistics
    } catch (error) {
      console.error(`Failed to fetch flight statistics: ${error}`, { error })
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

export default useFlightStatistics
