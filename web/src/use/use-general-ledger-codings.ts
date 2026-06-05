import { reactive, toRefs, unref, watch, ref } from "vue"

import generalLedgerCodingsApi, {
  type GeneralLedgerCodingAsIndex,
  type GeneralLedgerCodingSummaries,
  type GeneralLedgerCodingWhereOptions,
  type GeneralLedgerCodingFiltersOptions,
  type GeneralLedgerCodingQueryOptions,
} from "@/api/general-ledger-codings-api"

export {
  type GeneralLedgerCodingAsIndex,
  type GeneralLedgerCodingSummaries,
  type GeneralLedgerCodingWhereOptions,
  type GeneralLedgerCodingFiltersOptions,
  type GeneralLedgerCodingQueryOptions,
}

export function useGeneralLedgerCodings(
  options = ref<GeneralLedgerCodingQueryOptions>({}),
  { skipWatchIf = () => false }: { skipWatchIf?: () => boolean } = {}
) {
  const state = reactive<{
    generalLedgerCodings: GeneralLedgerCodingAsIndex[]
    totalCount: number
    summaries: GeneralLedgerCodingSummaries
    isLoading: boolean
    isErrored: boolean
  }>({
    generalLedgerCodings: [],
    totalCount: 0,
    summaries: {
      totalAmount: 0,
    },
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<GeneralLedgerCodingAsIndex[]> {
    state.isLoading = true
    try {
      const { generalLedgerCodings, totalCount, summaries } = await generalLedgerCodingsApi.list(
        unref(options)
      )
      state.generalLedgerCodings = generalLedgerCodings
      state.totalCount = totalCount
      state.summaries = summaries
      state.isErrored = false
      return generalLedgerCodings
    } catch (error) {
      console.error(`Failed to fetch general ledger codings: ${error}`, { error })
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

export default useGeneralLedgerCodings
