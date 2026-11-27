import { type Ref, onScopeDispose, reactive, toRefs, watch } from "vue"
import { isCancel } from "axios"

import {
  type TravelPortBooking,
  type TravelPortBookingsQueryOptions,
  travelPortBookingsApi,
} from "@/api/travel-desk-travel-requests/travel-port-bookings-api"

export function useTravelPortBookings(
  travelDeskTravelRequestId: Ref<number>,
  options: Ref<TravelPortBookingsQueryOptions>
) {
  const state = reactive<{
    travelPortBookings: TravelPortBooking[] | null
    totalCount: number
    errorMessage: string
  }>({
    travelPortBookings: null,
    totalCount: 0,
    errorMessage: "",
  })
  let requestController: AbortController | null = null

  async function fetch() {
    requestController?.abort()
    const controller = new AbortController()
    requestController = controller
    state.travelPortBookings = null
    state.errorMessage = ""
    try {
      const { travelPortBookings, totalCount } = await travelPortBookingsApi.list(
        travelDeskTravelRequestId.value,
        options.value,
        { signal: controller.signal }
      )
      if (controller.signal.aborted) return

      state.travelPortBookings = travelPortBookings
      state.totalCount = totalCount
    } catch (error) {
      if (isCancel(error) || controller.signal.aborted) return

      console.error("Failed to load TravelPort bookings", error)
      state.errorMessage = "TravelPort bookings could not be loaded. Try again."
      state.travelPortBookings = []
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
