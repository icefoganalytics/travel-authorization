import { reactive, toRefs, unref, watch } from "vue"
import { isEmpty, isNil, last } from "lodash"

import travelAuthorizationsApi, { STATUSES, TRIP_TYPES } from "@/api/travel-authorizations-api"

export { STATUSES, TRIP_TYPES }

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-authorizations-api.js').TravelAuthorization} TravelAuthorization */

/**
 * This stores a global user state per id.
 *
 * @callback UseMyTravelRequestWizardSummary
 * @param {Ref<string | number>} [travelAuthorizationId]
 * @returns {{
 *   travelPurposeId: Ref<number | null>,
 *   finalDestinationLocationId: Ref<number | null>,
 *   departureDate: Ref<string | null>,
 *   returnDate: Ref<string | null>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorization>,
 *   refresh: () => Promise<TravelAuthorization>,
 * }}
 */

const state = reactive({
  travelPurposeId: null,
  finalDestinationLocationId: null,
  departureDate: null,
  returnDate: null,
  isLoading: false,
  isErrored: false,
})

/** @type {UseMyTravelRequestWizardSummary} */
export function useMyTravelRequestWizardSummary(travelAuthorizationId) {
  async function fetch(params = {}) {
    const staticId = unref(travelAuthorizationId)

    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.get(staticId, params)
      state.isErrored = false

      state.travelPurposeId = travelAuthorization.purposeId
      state.finalDestinationLocationId = _determineFinalDestinationLocationId(
        travelAuthorization.stops
      )
      state.departureDate = _determineDepartureDate(travelAuthorization.stops)
      state.returnDate = travelAuthorization.dateBackToWork

      return travelAuthorization
    } catch (error) {
      console.error("Failed to fetch travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  function _determineFinalDestinationLocationId(stops) {
    if (isNil(stops) || isEmpty(stops)) return null

    const lastStop = last(stops)
    if (isNil(lastStop)) return null

    return lastStop.locationId
  }

  function _determineDepartureDate(stops) {
    if (isNil(stops) || isEmpty(stops)) return null

    return stops[0].departureDate
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
  }
}

export default useMyTravelRequestWizardSummary
