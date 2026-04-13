import { type Ref, reactive, toRefs, unref, watch, ref } from "vue"

import perDiemsApi, {
  PER_DIEM_CLAIM_TYPES,
  PER_DIEM_TRAVEL_REGIONS,
  PER_DIEM_CURRENCY_TYPES,
  PerDiemClaimTypes,
  PerDiemTravelRegions,
  PerDiemCurrencyTypes,
  type PerDiemAsIndex,
  type PerDiemWhereOptions,
  type PerDiemFiltersOptions,
  type PerDiemsQueryOptions,
} from "@/api/per-diems-api"

export {
  PER_DIEM_CLAIM_TYPES,
  PER_DIEM_TRAVEL_REGIONS,
  PER_DIEM_CURRENCY_TYPES,
  PerDiemClaimTypes,
  PerDiemTravelRegions,
  PerDiemCurrencyTypes,
  type PerDiemAsIndex,
  type PerDiemWhereOptions,
  type PerDiemFiltersOptions,
  type PerDiemsQueryOptions,
}

export function usePerDiems(
  options = ref<PerDiemsQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
): {
  perDiems: Ref<PerDiemAsIndex[]>
  totalCount: Ref<number>
  isLoading: Ref<boolean>
  isErrored: Ref<boolean>
  fetch: () => Promise<PerDiemAsIndex[]>
  refresh: () => Promise<PerDiemAsIndex[]>
} {
  const state = reactive<{
    perDiems: PerDiemAsIndex[]
    totalCount: number
    isLoading: boolean
    isErrored: boolean
  }>({
    perDiems: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<PerDiemAsIndex[]> {
    state.isLoading = true
    try {
      const { perDiems, totalCount } = await perDiemsApi.list(unref(options))
      state.isErrored = false
      state.perDiems = perDiems
      state.totalCount = totalCount
      return perDiems
    } catch (error) {
      console.error(`Failed to fetch per diems: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(options),
    async () => {
      if (skipWatchIf()) return

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

export default usePerDiems
