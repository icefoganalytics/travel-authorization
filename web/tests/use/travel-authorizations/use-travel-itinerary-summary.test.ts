import { effectScope, ref } from "vue"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import useTravelItinerarySummary from "@/use/travel-authorizations/use-travel-itinerary-summary"

describe("web/src/use/travel-authorizations/use-travel-itinerary-summary.ts", () => {
  describe("useTravelItinerarySummary", () => {
    test.each(["replace itinerary", "edit arrival", "change trip type"])(
      "when local inputs %s, the destination updates synchronously",
      (action) => {
        // Arrange
        const tripType = ref(TravelAuthorizationTripTypes.MULTI_CITY)
        const travelSegments = ref([
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 3 },
          { departureLocationId: 3, arrivalLocationId: 1 },
        ])
        const scope = effectScope()
        const summary = scope.run(() => useTravelItinerarySummary(tripType, travelSegments))
        if (!summary) throw new Error("Summary did not initialize")

        try {
          // Act
          if (action === "replace itinerary") {
            travelSegments.value = [{ departureLocationId: 1, arrivalLocationId: 4 }]
          } else if (action === "edit arrival") {
            travelSegments.value[1].arrivalLocationId = 4
          } else {
            tripType.value = TravelAuthorizationTripTypes.ONE_WAY
          }

          // Assert
          const destination = summary.finalDestinationLocationId.value
          expect(destination).toBe(action === "change trip type" ? 1 : 4)
        } finally {
          scope.stop()
        }
      }
    )
  })
})
