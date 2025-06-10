import { reactive, toRefs, unref, watch } from "vue"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"

/**
 * TODO: add other fields
 * @typedef {Object} GeneralLedgerCoding
 * @property {number} id
 */

/**
 * Fetches and manages expenses data based on the provided options.
 *
 * @param {import('vue').Ref<{
 *   where: { [key: string]: any },
 * }>} [options={}] - The configuration options for fetching expenses, wrapped in a Vue ref.
 * @param {{ skipWatchIf?: (options: any) => boolean }} [config={ skipWatchIf: () => false }]
 * @returns {{
 *   generalLedgerCodings: import('vue').Ref<GeneralLedgerCoding[]>,
 *   totalCount: import('vue').Ref<number>,
 *   isLoading: import('vue').Ref<boolean>,
 *   isErrored: import('vue').Ref<boolean>,
 *   fetch: () => Promise<GeneralLedgerCoding[]>,
 *   refresh: () => Promise<GeneralLedgerCoding[]>,
 * }}
 */
export function useGeneralLedgerCodings(options = ref({}), { skipWatchIf = () => false } = {}) {
  const state = reactive({
    generalLedgerCodings: [],
    totalCount: 0,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { generalLedgerCodings, totalCount } = await generalLedgerCodingsApi.list(unref(options))
      state.generalLedgerCodings = generalLedgerCodings
      state.totalCount = totalCount
      state.isErrored = false
      return generalLedgerCodings
    } catch (error) {
      console.error("Failed to fetch general ledger codings:", error)
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
