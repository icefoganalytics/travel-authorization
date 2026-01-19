import { reactive, toRefs, unref, watch, ref } from "vue"

import travelDeskOtherTransportationsApi, {
  type TravelDeskOtherTransportationAsIndex,
  type TravelDeskOtherTransportationWhereOptions,
  type TravelDeskOtherTransportationFiltersOptions,
  type TravelDeskOtherTransportationsQueryOptions,
  TravelDeskOtherTransportationStatuses,
  TravelDeskOtherTransportationTypes,
} from "@/api/travel-desk-other-transportations-api"

export {
  type TravelDeskOtherTransportationAsIndex,
  type TravelDeskOtherTransportationWhereOptions,
  type TravelDeskOtherTransportationFiltersOptions,
  type TravelDeskOtherTransportationsQueryOptions,
  TravelDeskOtherTransportationStatuses,
  TravelDeskOtherTransportationTypes,
}

export function useTravelDeskOtherTransportations(
  options = ref<TravelDeskOtherTransportationsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    travelDeskOtherTransportations: TravelDeskOtherTransportationAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskOtherTransportations: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskOtherTransportationAsIndex[]> {
    state.isLoading = true
    try {
      const { travelDeskOtherTransportations, totalCount } =
        await travelDeskOtherTransportationsApi.list(unref(options))
      state.isErrored = false
      state.travelDeskOtherTransportations = travelDeskOtherTransportations
      state.totalCount = totalCount
      return travelDeskOtherTransportations
    } catch (error) {
      console.error(`Failed to fetch travel desk other transportations: ${error}`, {
        error,
      })
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

export default useTravelDeskOtherTransportations
