import { type MaybeRefOrGetter, computed, toValue } from "vue"

import { type TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

import determineFinalDestinationSegment from "@/use/travel-authorizations/travel-authorization-summaries/determine-final-destination-segment"

export function useTravelItinerarySummary(
  tripType: MaybeRefOrGetter<TravelAuthorizationTripTypes | null | undefined>,
  travelSegments: MaybeRefOrGetter<readonly Partial<TravelSegment>[] | null | undefined>
) {
  const finalDestinationSegment = computed(() =>
    determineFinalDestinationSegment(toValue(tripType), toValue(travelSegments))
  )
  const finalDestinationLocationId = computed(
    () => finalDestinationSegment.value?.arrivalLocationId ?? null
  )

  return {
    finalDestinationSegment,
    finalDestinationLocationId,
  }
}

export default useTravelItinerarySummary
