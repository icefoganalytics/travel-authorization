import { type Ref, onScopeDispose, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import locationsApi, { type LocationAsShow } from "@/api/locations-api"

export { type LocationAsShow }

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

  let requestController: AbortController | undefined

  async function fetch(): Promise<LocationAsShow | null> {
    const staticLocationId = unref(locationId)
    if (isNil(staticLocationId)) {
      throw new Error("locationId is required")
    }

    requestController?.abort()
    const controller = new AbortController()
    requestController = controller
    state.isLoading = true
    try {
      const { location } = await locationsApi.get(staticLocationId, { signal: controller.signal })
      if (controller.signal.aborted) {
        return null
      }

      state.isErrored = false
      state.location = location
      return location
    } catch (error) {
      if (controller.signal.aborted) {
        return null
      }

      state.isErrored = true
      throw error
    } finally {
      if (!controller.signal.aborted) {
        state.isLoading = false
      }
    }
  }

  watch(
    () => unref(locationId),
    async (newLocationId) => {
      if (isNil(newLocationId)) {
        requestController?.abort()
        state.isLoading = false
        state.isErrored = false
        state.location = null
        return
      }

      await fetch()
    },
    {
      immediate: true,
    }
  )

  onScopeDispose(() => requestController?.abort())

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useLocation
