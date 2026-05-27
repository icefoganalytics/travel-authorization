import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import locationsApi, { type LocationAsShow } from "@/api/locations-api"

export function useLocation(locationId: Ref<number | null | undefined>) {
  const state = reactive<{
    location: LocationAsShow | null
    isLoading: boolean
    isErrored: boolean
  }>({
    location: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<LocationAsShow> {
    const staticLocationId = unref(locationId)
    if (isNil(staticLocationId)) {
      throw new Error("locationId is required")
    }

    state.isLoading = true
    try {
      const { location } = await locationsApi.get(staticLocationId)
      state.isErrored = false
      state.location = location
      return location
    } catch (error) {
      console.error(`Failed to fetch location: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(locationId),
    async (newLocationId) => {
      if (isNil(newLocationId)) return

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
