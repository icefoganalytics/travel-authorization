import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import locationsApi from "@/api/locations-api"

/**
 * @typedef {import('@/api/locations-api.js').Location} Location
 */

/**
 * Provides reactive state for a location.
 *
 * @callback UseLocation
 * @param {import('vue').Ref<number | null | undefined>} locationId
 * @returns {{
 *   location: import('vue').Ref<Location | null>,
 *   isLoading: import('vue').Ref<boolean>,
 *   isErrored: import('vue').Ref<boolean>,
 *   fetch: () => Promise<Location>,
 *   refresh: () => Promise<Location>,
 * }}
 */

/** @type {UseLocation} */
export function useLocation(locationId) {
  const state = reactive({
    location: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { location } = await locationsApi.get(unref(locationId))
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
