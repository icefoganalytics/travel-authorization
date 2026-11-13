import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { has, isEmpty, isNil } from "lodash"

import determineFinalDestinationSegment from "@/utils/determine-final-destination-segment"

import travelAuthorizationsApi, {
  type TravelAuthorizationAsShow,
  STATUSES,
  TRIP_TYPES,
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
} from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

export {
  type TravelAuthorizationAsShow,
  STATUSES,
  TRIP_TYPES,
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
}

export type TravelAuthorizationSummary = {
  travelPurposeId: number | null
  eventName: string | null
  finalDestinationLocationId: number | null
  departureDate: string | null
  returnDate: string | null
  userId: number | null
}

export function useTravelAuthorizationSummary(
  travelAuthorizationId?: Ref<number | null | undefined>
) {
  const state = reactive<
    TravelAuthorizationSummary & {
      isLoading: boolean
      isErrored: boolean
    }
  >({
    travelPurposeId: null,
    eventName: null,
    finalDestinationLocationId: null,
    departureDate: null,
    returnDate: null,
    userId: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(params = {}): Promise<TravelAuthorizationAsShow> {
    const staticId = unref(travelAuthorizationId)
    if (isNil(staticId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.get(staticId, params)
      state.isErrored = false

      state.travelPurposeId = travelAuthorization.purposeId
      state.eventName = travelAuthorization.eventName

      let tripType = travelAuthorization.tripTypeEstimate
      if (!isNil(travelAuthorization.tripTypeActual)) {
        tripType = travelAuthorization.tripTypeActual
      }

      const useActuals = !isNil(travelAuthorization.tripTypeActual)
      const travelSegments = travelAuthorization.travelSegments.filter(
        (segment) => segment.isActual === useActuals
      )
      const finalDestinationSegment = determineFinalDestinationSegment(tripType, travelSegments)
      state.finalDestinationLocationId = finalDestinationSegment?.arrivalLocationId ?? null
      state.departureDate = _determineDepartureDate(travelSegments)
      state.returnDate =
        travelAuthorization.dateBackToWorkActual || travelAuthorization.dateBackToWorkEstimate
      state.userId = travelAuthorization.userId
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to fetch travel authorization: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  function update(attributes: Partial<typeof state>): typeof state {
    Object.entries(attributes).forEach(([key, value]) => {
      if (!has(state, key)) return

      state[key] = value
    })
    return state
  }

  function _determineDepartureDate(travelSegments: TravelSegment[]): string | null {
    if (isNil(travelSegments) || isEmpty(travelSegments)) return null

    const initialSegment = travelSegments.at(0)
    if (isNil(initialSegment)) return null

    const departureDate = initialSegment.departureOn
    return departureDate
  }

  watch(
    () => unref(travelAuthorizationId),
    async (newTravelAuthorizationId) => {
      if (isNil(newTravelAuthorizationId)) return

      await fetch()
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    update,
  }
}

export default useTravelAuthorizationSummary
