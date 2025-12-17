import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelPurposesApi from "@/api/travel-purposes-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import('@/api/travel-purposes-api.js').TravelPurpose} TravelPurpose */

/**
 * @callback UseTravelPurpose
 * @param {Ref<number | null | undefined>} id
 * @returns {{
 *   travelPurpose: Ref<TravelPurpose | null | undefined>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelPurpose>,
 *   refresh: () => Promise<TravelPurpose>,
 * }}
 */

/** @type {UseTravelPurpose} */
export function useTravelPurpose(id) {
  const state = reactive({
    travelPurpose: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelPurpose } = await travelPurposesApi.get(unref(id))
      state.isErrored = false
      state.travelPurpose = travelPurpose
      return travelPurpose
    } catch (error) {
      console.error("Failed to fetch travel purpose:", error)
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
