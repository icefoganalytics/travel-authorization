import { type Ref, computed } from "vue"
import { isNil } from "lodash"

import useTravelDeskFlightSegments, {
  type TravelDeskFlightSegmentsQueryOptions,
} from "@/use/use-travel-desk-flight-segments"
import useTravelAuthorizations from "@/use/use-travel-authorizations"

/**
 * Composable for getting travel time information for a travel desk travel request.
 *
 * Note: This composable makes multiple API calls to gather travel authorization and flight segment data.
 * For better performance and simplicity, consider denormalizing these fields onto the Travel Desk travel request
 * model itself, as this data is commonly needed together.
 *
 * @param travelDeskTravelRequestId - The travel desk travel request ID
 * @returns Object containing travel date information and refresh function
 */
export function useTravelTimesSummary(travelDeskTravelRequestId: Ref<number>) {
  // TODO: Consider denormalizing travel authorization dates onto travel desk travel request for performance
  const travelAuthorizationQuery = computed(() => ({
    filters: {
      forTravelDeskTravelRequest: travelDeskTravelRequestId.value,
    },
    perPage: 1,
  }))
  const { travelAuthorizations, refresh: refreshTravelAuthorizations } =
    useTravelAuthorizations(travelAuthorizationQuery)
  const travelAuthorization = computed(() => travelAuthorizations.value[0])

  const tripStartDate = computed(() => {
    if (isNil(travelAuthorization.value)) return null

    const { departingAt } = travelAuthorization.value
    if (isNil(departingAt)) return null

    return departingAt.slice(0, 10)
  })
  const tripEndDate = computed(() => {
    if (isNil(travelAuthorization.value)) return null

    const { dateBackToWorkEstimate } = travelAuthorization.value
    if (isNil(dateBackToWorkEstimate)) return null

    return dateBackToWorkEstimate.slice(0, 10)
  })

  // TODO: Consider denormalizing first flight segment onto travel desk travel request for performance
  const firstTravelDeskFlightSegmentQuery = computed<TravelDeskFlightSegmentsQueryOptions>(() => ({
    filters: {
      forTravelRequest: travelDeskTravelRequestId.value,
    },
    order: [["departAt", "ASC"]],
    perPage: 1,
  }))
  const {
    travelDeskFlightSegments: firstTravelDeskFlightSegments,
    refresh: refreshfirstTravelDeskFlightSegment,
  } = useTravelDeskFlightSegments(firstTravelDeskFlightSegmentQuery)
  const firstTravelDeskFlightSegment = computed(() => firstTravelDeskFlightSegments.value[0])
  const flightStartDate = computed(() => {
    if (isNil(firstTravelDeskFlightSegment.value)) return null

    const { departAt } = firstTravelDeskFlightSegment.value
    return departAt.slice(0, 10)
  })

  // TODO: Consider denormalizing last flight segment onto travel desk travel request for performance
  const lastTravelDeskFlightSegmentQuery = computed<TravelDeskFlightSegmentsQueryOptions>(() => ({
    filters: {
      forTravelRequest: travelDeskTravelRequestId.value,
    },
    order: [["arriveAt", "DESC"]],
    perPage: 1,
  }))
  const {
    travelDeskFlightSegments: lastTravelDeskFlightSegments,
    refresh: refreshLastTravelDeskFlightSegment,
  } = useTravelDeskFlightSegments(lastTravelDeskFlightSegmentQuery)
  const lastTravelDeskFlightSegment = computed(() => lastTravelDeskFlightSegments.value[0])
  const flightEndDate = computed(() => {
    if (isNil(lastTravelDeskFlightSegment.value)) return null

    const { arriveAt } = lastTravelDeskFlightSegment.value
    return arriveAt.slice(0, 10)
  })

  async function refresh() {
    await refreshTravelAuthorizations()
    await refreshfirstTravelDeskFlightSegment()
    await refreshLastTravelDeskFlightSegment()
  }

  return {
    tripStartDate,
    tripEndDate,
    flightStartDate,
    flightEndDate,
    refresh,
  }
}

export default useTravelTimesSummary
