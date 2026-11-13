import { type Ref, computed, reactive, toRefs, unref, watch } from "vue"
import { has, isEmpty, isNil } from "lodash"

import travelAuthorizationsApi, {
  type TravelAuthorizationAsShow,
  STATUSES,
  TRIP_TYPES,
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
} from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

import determineFinalDestinationSegment from "@/use/travel-authorizations/travel-authorization-summaries/determine-final-destination-segment"

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
  travelAuthorizationId: Ref<number | null | undefined>
) {
  const state = reactive<
    TravelAuthorizationSummary & {
      travelAuthorization: TravelAuthorizationAsShow | null
      isLoading: boolean
      isErrored: boolean
    }
  >({
    travelAuthorization: null,
    travelPurposeId: null,
    eventName: null,
    finalDestinationLocationId: null,
    departureDate: null,
    returnDate: null,
    userId: null,
    isLoading: false,
    isErrored: false,
  })

  const tripType = computed(() => {
    const { travelAuthorization } = state
    if (isNil(travelAuthorization)) return null

    if (isNil(travelAuthorization.tripTypeActual)) {
      return travelAuthorization.tripTypeEstimate
    }

    return travelAuthorization.tripTypeActual
  })

  const travelSegments = computed(() => {
    const { travelAuthorization } = state
    if (isNil(travelAuthorization)) return []

    const useActuals = !isNil(travelAuthorization.tripTypeActual)
    return travelAuthorization.travelSegments.filter((segment) => segment.isActual === useActuals)
  })

  const finalDestinationSegment = computed(() => {
    return determineFinalDestinationSegment(tripType.value, travelSegments.value)
  })

  async function fetch(params = {}): Promise<TravelAuthorizationAsShow> {
    const staticId = unref(travelAuthorizationId)
    if (isNil(staticId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization: record } = await travelAuthorizationsApi.get(staticId, params)
      state.travelAuthorization = record
      state.isErrored = false

      state.travelPurposeId = record.purposeId
      state.eventName = record.eventName

      state.finalDestinationLocationId = finalDestinationSegment.value?.arrivalLocationId ?? null
      state.departureDate = _determineDepartureDate(travelSegments.value)
      state.returnDate = record.dateBackToWorkActual || record.dateBackToWorkEstimate
      state.userId = record.userId
      return record
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
    finalDestinationSegment,
    fetch,
    refresh: fetch,
    update,
  }
}

export default useTravelAuthorizationSummary
