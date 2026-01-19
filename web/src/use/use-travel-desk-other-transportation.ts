import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelDeskOtherTransportationsApi, {
  type TravelDeskOtherTransportationAsShow,
  type TravelDeskOtherTransportationPolicy,
  TravelDeskOtherTransportationStatuses,
  TravelDeskOtherTransportationTypes,
} from "@/api/travel-desk-other-transportations-api"

export {
  type TravelDeskOtherTransportationAsShow,
  type TravelDeskOtherTransportationPolicy,
  TravelDeskOtherTransportationStatuses,
  TravelDeskOtherTransportationTypes,
}

export function useTravelDeskOtherTransportation(
  travelDeskOtherTransportationId: Ref<number | null | undefined>
) {
  const state = reactive<{
    travelDeskOtherTransportation: TravelDeskOtherTransportationAsShow | null
    policy: TravelDeskOtherTransportationPolicy | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelDeskOtherTransportation: null,
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelDeskOtherTransportationAsShow> {
    const staticId = unref(travelDeskOtherTransportationId)
    if (isNil(staticId)) {
      throw new Error("travelDeskOtherTransportationId is required")
    }

    state.isLoading = true
    try {
      const { travelDeskOtherTransportation, policy } =
        await travelDeskOtherTransportationsApi.get(staticId)

      state.isErrored = false
      state.travelDeskOtherTransportation = travelDeskOtherTransportation
      state.policy = policy

      return travelDeskOtherTransportation
    } catch (error) {
      console.error(`Failed to fetch travel desk other transportation: ${error}`, { error })

      state.isErrored = true

      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(travelDeskOtherTransportationId),
    async (newTravelDeskOtherTransportationId) => {
      if (isNil(newTravelDeskOtherTransportationId)) {
        return
      }

      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTravelDeskOtherTransportation
