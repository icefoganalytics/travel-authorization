import { reactive, toRefs, unref, watch, ref } from "vue"

import travelAllowancesApi, {
  TRAVEL_ALLOWANCE_ALLOWANCE_TYPES,
  TRAVEL_ALLOWANCE_CURRENCY_TYPES,
  TravelAllowanceAllowanceTypes,
  TravelAllowanceCurrencyTypes,
  type TravelAllowanceAsIndex,
  type TravelAllowanceWhereOptions,
  type TravelAllowanceFiltersOptions,
  type TravelAllowancesQueryOptions,
} from "@/api/travel-allowances-api"

export {
  TRAVEL_ALLOWANCE_ALLOWANCE_TYPES,
  TRAVEL_ALLOWANCE_CURRENCY_TYPES,
  TravelAllowanceAllowanceTypes,
  TravelAllowanceCurrencyTypes,
  type TravelAllowanceAsIndex,
  type TravelAllowanceWhereOptions,
  type TravelAllowanceFiltersOptions,
  type TravelAllowancesQueryOptions,
}

export function useTravelAllowances(
  options = ref<TravelAllowancesQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelAllowances: TravelAllowanceAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAllowances: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAllowanceAsIndex[]> {
    state.isLoading = true
    try {
      const { travelAllowances, totalCount } = await travelAllowancesApi.list(unref(options))
      state.isErrored = false
      state.travelAllowances = travelAllowances
      state.totalCount = totalCount
      return travelAllowances
    } catch (error) {
      console.error(`Failed to fetch travel allowances: ${error}`, { error })
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

export default useTravelAllowances
