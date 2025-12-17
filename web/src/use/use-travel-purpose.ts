import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelPurposesApi, { type TravelPurpose } from "@/api/travel-purposes-api"

export { type TravelPurpose }

export function useTravelPurpose(id: Ref<number | null | undefined>) {
  const state = reactive<{
    travelPurpose: TravelPurpose | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelPurpose: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelPurpose> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { travelPurpose } = await travelPurposesApi.get(staticId)
      state.isErrored = false
      state.travelPurpose = travelPurpose
      return travelPurpose
    } catch (error) {
      console.error(`Failed to fetch travel purpose: ${error}`, { error })
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

export default useTravelPurpose
