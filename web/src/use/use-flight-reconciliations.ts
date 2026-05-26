import { reactive, toRefs, unref, watch, ref } from "vue"

import flightReconciliationsApi, {
  type FlightReconciliationAsIndex,
  type FlightReconciliationWhereOptions,
  type FlightReconciliationFiltersOptions,
  type FlightReconciliationsQueryOptions,
} from "@/api/flight-reconciliations-api"

export {
  type FlightReconciliationAsIndex,
  type FlightReconciliationWhereOptions,
  type FlightReconciliationFiltersOptions,
  type FlightReconciliationsQueryOptions,
}

export function useFlightReconciliations(
  options = ref<FlightReconciliationsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    flightReconciliations: FlightReconciliationAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    flightReconciliations: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<FlightReconciliationAsIndex[]> {
    state.isLoading = true
    try {
      const { flightReconciliations, totalCount } = await flightReconciliationsApi.list(
        unref(options)
      )
      state.isErrored = false
      state.flightReconciliations = flightReconciliations
      state.totalCount = totalCount
      return flightReconciliations
    } catch (error) {
      console.error(`Failed to fetch flight reconciliations: ${error}`, { error })
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

export default useFlightReconciliations
