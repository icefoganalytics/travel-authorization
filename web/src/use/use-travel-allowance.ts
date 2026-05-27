import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelAllowancesApi, { type TravelAllowanceAsShow } from "@/api/travel-allowances-api"

export function useTravelAllowance(id: Ref<number | null | undefined>) {
  const state = reactive<{
    travelAllowance: TravelAllowanceAsShow | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAllowance: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAllowanceAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { travelAllowance } = await travelAllowancesApi.get(staticId)
      state.isErrored = false
      state.travelAllowance = travelAllowance
      return travelAllowance
    } catch (error) {
      console.error("Failed to fetch travel allowance:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) return

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

export default useTravelAllowance
