import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import generalLedgerCodingsApi, {
  type GeneralLedgerCodingAsShow,
} from "@/api/general-ledger-codings-api"

export { type GeneralLedgerCodingAsShow }

export function useGeneralLedgerCoding(generalLedgerCodingId: Ref<number | null | undefined>) {
  const state = reactive<{
    generalLedgerCoding: GeneralLedgerCodingAsShow | null
    isLoading: boolean
    isErrored: boolean
  }>({
    generalLedgerCoding: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<GeneralLedgerCodingAsShow | null> {
    const staticGeneralLedgerCodingId = unref(generalLedgerCodingId)
    if (isNil(staticGeneralLedgerCodingId)) {
      throw new Error("generalLedgerCodingId is required")
    }

    state.isLoading = true
    try {
      const { generalLedgerCoding } = await generalLedgerCodingsApi.get(staticGeneralLedgerCodingId)
      state.generalLedgerCoding = generalLedgerCoding
      state.isErrored = false

      return state.generalLedgerCoding
    } catch (error) {
      console.error(`Failed to fetch general ledger coding: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(generalLedgerCodingId),
    async (newGeneralLedgerCodingId) => {
      if (isNil(newGeneralLedgerCodingId)) return

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useGeneralLedgerCoding
