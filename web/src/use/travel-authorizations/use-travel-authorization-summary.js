import { reactive, toRefs, unref, watch } from "vue"
import { isEmpty, isNil } from "lodash"

import travelAuthorizationsApi, { STATUSES, TRIP_TYPES } from "@/api/travel-authorizations-api"

export { STATUSES, TRIP_TYPES }

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/**
 * @template [T=any]
 * @typedef {import('vue').ToRefs<T>} ToRefs
 */
/** @typedef {import('@/api/travel-authorizations-api.js').TravelAuthorization} TravelAuthorization */

/**
 * @typedef {{
 *   travelPurposeId: number | null,
 *   finalDestinationLocationId: number | null,
 *   departureDate: string | null,
 *   returnDate: string | null,
 *   userId: number | null,
 * }} TravelAuthorizationSummary
 */

/**
 * @callback UseTravelAuthorizationSummary
 * @param {Ref<string | number>} [travelAuthorizationId]
 * @returns {ToRefs<TravelAuthorizationSummary> & {
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorization>,
 *   refresh: () => Promise<TravelAuthorization>,
 *   update: (attributes: Partial<TravelAuthorizationSummary>) => void,
 * }}
 */

/** @type {UseTravelAuthorizationSummary} */
export function useTravelAuthorizationSummary(travelAuthorizationId) {
  const state = reactive({
    travelPurposeId: null,
    finalDestinationLocationId: null,
    departureDate: null,
    returnDate: null,
    userId: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(params = {}) {
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
      console.error("Failed to fetch travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  /**
   * @param {Partial<TravelAuthorizationSummary>} attributes
   */
  function update(attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      state[key] = value
    })
    return state
  }

  /**
   * @param {TRIP_TYPES} tripType
   * @param {TravelSegment[]} travelSegments
   * @returns {number | null}
   *
   * TODO: update to handle differences between estimates and actuals
   */
  function _determineFinalDestinationLocationId(tripType, travelSegments) {
    if (isNil(travelSegments) || isEmpty(travelSegments)) return null

    let finalDestinationLocationId = null
    if (tripType === TRIP_TYPES.ROUND_TRIP) {
      finalDestinationLocationId = travelSegments.at(-2)?.arrivalLocationId
    } else {
      finalDestinationLocationId = travelSegments.at(-1)?.arrivalLocationId
    }

    return finalDestinationLocationId
  }

  /**
   * @param {TravelSegment[]} travelSegments
   * @returns {string | null}
   *
   * TODO: update to handle differences between estimates and actuals
   */
  function _determineDepartureDate(travelSegments) {
    if (isNil(travelSegments) || isEmpty(travelSegments)) return null

    const departureDate = travelSegments.at(0)?.departureOn
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
    // methods
    fetch,
    refresh: fetch,
    update,
  }
}

export default useTravelAuthorizationSummary
