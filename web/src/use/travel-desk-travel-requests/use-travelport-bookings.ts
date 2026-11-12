import { type Ref, onScopeDispose, reactive, toRefs, watch } from "vue"
import { isCancel } from "axios"

import {
  type TravelportBooking,
  type TravelportBookingsQueryOptions,
  travelportBookingsApi,
} from "@/api/travel-desk-travel-requests/travelport-bookings-api"

export function useTravelportBookings(
  travelDeskTravelRequestId: Ref<number>,
  options: Ref<TravelportBookingsQueryOptions>
) {
  const state = reactive<{
    travelportBookings: TravelportBooking[] | null
    totalCount: number
    errorMessage: string
  }>({
    travelportBookings: null,
    totalCount: 0,
    errorMessage: "",
  })
  let requestController: AbortController | null = null

  async function fetch() {
    requestController?.abort()
    const controller = new AbortController()
    requestController = controller
    state.travelportBookings = null
    state.errorMessage = ""
    try {
      const { travelportBookings, totalCount } = await travelportBookingsApi.list(
        travelDeskTravelRequestId.value,
        options.value,
        { signal: controller.signal }
      )
      if (controller.signal.aborted) return

      state.travelportBookings = travelportBookings
      state.totalCount = totalCount
    } catch (error) {
      if (isCancel(error) || controller.signal.aborted) return

      console.error("Failed to load Travelport bookings", error)
      state.errorMessage = "Travelport bookings could not be loaded. Try again."
      state.travelportBookings = []
      state.totalCount = 0
    }
  }

  watch([travelDeskTravelRequestId, options], fetch, { deep: true, immediate: true })
  onScopeDispose(() => requestController?.abort())

  return {
    ...toRefs(state),
    fetch,
  }
}
