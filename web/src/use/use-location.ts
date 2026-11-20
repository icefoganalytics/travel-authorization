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

  async function fetch(): Promise<LocationAsShow | null> {
    const staticLocationId = unref(locationId)
    if (isNil(staticLocationId)) {
      throw new Error("locationId is required")
    }

    state.isLoading = true
    try {
      const { location } = await locationsApi.get(staticLocationId)
      if (locationId.value !== staticLocationId) {
        return null
      }

      state.isErrored = false
      state.location = location
      return location
    } catch (error) {
      if (locationId.value !== staticLocationId) {
        return null
      }

      state.isErrored = true
      throw error
    } finally {
      if (locationId.value === staticLocationId) {
        state.isLoading = false
      }
    }
  }

  watch(
    () => unref(locationId),
    async (newLocationId) => {
      state.location = null
      state.isErrored = false
      if (isNil(newLocationId)) {
        state.isLoading = false
        return
      }

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
