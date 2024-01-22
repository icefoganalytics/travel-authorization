import { reactive, toRefs, unref, watch } from "vue"

import locationsApi from "@/api/locations-api"

export function useLocation(locationId) {
  const state = reactive({
    location: {},
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { location } = await locationsApi.fetch(unref(locationId))
      state.isErrored = false
      state.location = location
      return location
    } catch (error) {
      console.error("Failed to fetch location:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(locationId),
    async () => {
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

export default useLocation