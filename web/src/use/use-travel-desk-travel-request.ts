import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelDeskTravelRequestsApi, {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
  type TravelDeskTravelRequestAsShow,
  type TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

export {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
  type TravelDeskTravelRequestAsShow,
  type TravelDeskTravelRequestStatuses,
}

export function useTravelDeskTravelRequest(
  travelDeskTravelRequestId: Ref<number | null | undefined>
) {
  const state = reactive<{
    travelDeskTravelRequest: TravelDeskTravelRequestAsShow | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskTravelRequest: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskTravelRequestAsShow> {
    const staticId = unref(travelDeskTravelRequestId)
    if (isNil(staticId)) {
      throw new Error("travelDeskTravelRequestId is required")
    }

    state.isLoading = true
    try {
      const { travelDeskTravelRequest } = await travelDeskTravelRequestsApi.get(staticId)
      state.isErrored = false
      state.travelDeskTravelRequest = travelDeskTravelRequest
      return travelDeskTravelRequest
    } catch (error) {
      console.error(`Failed to fetch travel desk travel request: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(): Promise<TravelDeskTravelRequestAsShow> {
    const staticId = unref(travelDeskTravelRequestId)
    if (isNil(staticId)) {
      throw new Error("travelDeskTravelRequestId is required")
    }

    if (!state.travelDeskTravelRequest) {
      throw new Error("travelDeskTravelRequest is required")
    }

    state.isLoading = true
    try {
      const { travelDeskTravelRequest } = await travelDeskTravelRequestsApi.update(
        staticId,
        state.travelDeskTravelRequest
      )
      state.isErrored = false
      state.travelDeskTravelRequest = travelDeskTravelRequest
      return travelDeskTravelRequest
    } catch (error) {
      console.error(`Failed to save travel desk travel request: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  /** @deprecated - prefer inline api calls for state changes to avoid cluttering the composables */
  async function submit(): Promise<TravelDeskTravelRequestAsShow> {
    const staticId = unref(travelDeskTravelRequestId)
    if (isNil(staticId)) {
      throw new Error("travelDeskTravelRequestId is required")
    }

    if (!state.travelDeskTravelRequest) {
      throw new Error("travelDeskTravelRequest is required")
    }

    state.isLoading = true
    try {
      const { travelDeskTravelRequest } = await travelDeskTravelRequestsApi.submit(
        staticId,
        state.travelDeskTravelRequest
      )
      state.isErrored = false
      state.travelDeskTravelRequest = travelDeskTravelRequest
      return travelDeskTravelRequest
    } catch (error) {
      console.error(`Failed to submit travel desk travel request: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(travelDeskTravelRequestId),
    async (newId) => {
      if (isNil(newId)) return

      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    save,
    submit,
  }
}

export default useTravelDeskTravelRequest
