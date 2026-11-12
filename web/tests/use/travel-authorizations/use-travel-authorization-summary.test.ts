import { effectScope, ref } from "vue"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"
import { mockHttpClient } from "@/tests/support"

describe("web/src/use/travel-authorizations/use-travel-authorization-summary.ts", () => {
  describe("useTravelAuthorizationSummary", () => {
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
        const summary = scope.run(() =>
          useTravelAuthorizationSummary(undefined, { tripType, travelSegments })
        )
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

    test("when summarizing supplied segments, does not fetch another authorization", () => {
      // Arrange
      const httpClient = mockHttpClient()
      const scope = effectScope()

      try {
        // Act
        scope.run(() =>
          useTravelAuthorizationSummary(undefined, {
            tripType: TravelAuthorizationTripTypes.ONE_WAY,
            travelSegments: [{ departureLocationId: 1, arrivalLocationId: 2 }],
          })
        )

        // Assert
        expect(httpClient.get).not.toHaveBeenCalled()
      } finally {
        scope.stop()
      }
    })
  })
})
