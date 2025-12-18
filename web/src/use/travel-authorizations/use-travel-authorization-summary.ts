import { type Ref, reactive, toRefs, unref, watch } from "vue"
import { has, isEmpty, isNil } from "lodash"

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

      const tripType = travelAuthorization.tripTypeActual || travelAuthorization.tripTypeEstimate
      const travelSegments = travelAuthorization.tripTypeActual
        ? travelAuthorization.travelSegments.filter((segment) => segment.isActual)
        : travelAuthorization.travelSegments.filter((segment) => !segment.isActual)
      state.finalDestinationLocationId = _determineFinalDestinationLocationId(
        tripType,
        travelSegments
      )
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

  function _determineFinalDestinationLocationId(
    tripType: TravelAuthorizationTripTypes | null,
    travelSegments: TravelSegment[]
  ): number | null {
    if (isNil(travelSegments) || isEmpty(travelSegments)) return null

    let finalDestinationLocationId: number | null = null
    if (tripType === TravelAuthorizationTripTypes.ROUND_TRIP) {
      const finalDestinationSegment = travelSegments.at(-2)
      if (isNil(finalDestinationSegment)) return null

      finalDestinationLocationId = finalDestinationSegment.arrivalLocationId
    } else {
      const finalDestinationSegment = travelSegments.at(-1)
      if (isNil(finalDestinationSegment)) return null

      finalDestinationLocationId = finalDestinationSegment.arrivalLocationId
    }

    return finalDestinationLocationId
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
