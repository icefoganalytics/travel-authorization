import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import perDiemsApi, { type PerDiemAsShow } from "@/api/per-diems-api"

export function usePerDiem(id: Ref<number | null | undefined>) {
  const state = reactive<{
    perDiem: PerDiemAsShow | null
    isLoading: boolean
    isErrored: boolean
  }>({
    perDiem: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<PerDiemAsShow> {
    const staticId = unref(id)
    if (isNil(staticId)) {
      throw new Error("id is required")
    }

    state.isLoading = true
    try {
      const { perDiem } = await perDiemsApi.get(staticId)
      state.isErrored = false
      state.perDiem = perDiem
      return perDiem
    } catch (error) {
      console.error("Failed to fetch per diem:", error)
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

export default usePerDiem
