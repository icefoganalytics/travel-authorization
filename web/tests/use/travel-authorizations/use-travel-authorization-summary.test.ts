import { flushPromises } from "@vue/test-utils"
import { effectScope, ref } from "vue"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { travelAuthorizationFactory } from "@/tests/factories"
import { mockHttpClient } from "@/tests/support"

import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"

describe("web/src/use/travel-authorizations/use-travel-authorization-summary.ts", () => {
  describe("useTravelAuthorizationSummary", () => {
    test.each(["replace itinerary", "edit arrival", "change trip type"])(
      "when local inputs %s, the destination updates synchronously",
      async (action) => {
        // Arrange
        const travelAuthorization = travelAuthorizationFactory.asShow().build({ id: 1 })
        mockHttpClient().get.mockResolvedValue({ data: { travelAuthorization } })
        const tripType = ref(TravelAuthorizationTripTypes.MULTI_CITY)
        const travelSegments = ref([
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 3 },
          { departureLocationId: 3, arrivalLocationId: 1 },
        ])
        const scope = effectScope()
        const summary = scope.run(() =>
          useTravelAuthorizationSummary(ref(1), { tripType, travelSegments })
        )
        if (!summary) throw new Error("Summary did not initialize")
        await flushPromises()

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

    test("when actual travel is absent, selects the estimated itinerary", async () => {
      // Arrange
      const estimatedAuthorization = travelAuthorizationFactory.asShow().build({
        id: 1,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: null,
        travelSegments: [
          { isActual: false, arrivalLocationId: 2 },
          { isActual: true, arrivalLocationId: 3 },
        ],
      })
      mockHttpClient().get.mockResolvedValue({
        data: { travelAuthorization: estimatedAuthorization },
      })
      const travelAuthorizationId = ref(1)
      const scope = effectScope()
      const summary = scope.run(() => useTravelAuthorizationSummary(travelAuthorizationId))
      if (!summary) throw new Error("Summary did not initialize")

      try {
        // Act
        await flushPromises()

        // Assert
        expect(summary.finalDestinationLocationId.value).toBe(2)
      } finally {
        scope.stop()
      }
    })

    test("when the authorization changes, selects the new record's actual itinerary", async () => {
      // Arrange
      const estimatedAuthorization = travelAuthorizationFactory.asShow().build({
        id: 1,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: null,
        travelSegments: [
          { isActual: false, arrivalLocationId: 2 },
          { isActual: true, arrivalLocationId: 3 },
        ],
      })
      const actualAuthorization = travelAuthorizationFactory.asShow().build({
        id: 2,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: TravelAuthorizationTripTypes.ONE_WAY,
        travelSegments: [
          { isActual: false, arrivalLocationId: 4 },
          { isActual: true, arrivalLocationId: 5 },
        ],
      })
      mockHttpClient()
        .get.mockResolvedValueOnce({ data: { travelAuthorization: estimatedAuthorization } })
        .mockResolvedValueOnce({ data: { travelAuthorization: actualAuthorization } })
      const travelAuthorizationId = ref(1)
      const scope = effectScope()
      const summary = scope.run(() => useTravelAuthorizationSummary(travelAuthorizationId))
      if (!summary) throw new Error("Summary did not initialize")

      try {
        // Act
        await flushPromises()
        travelAuthorizationId.value = 2
        await flushPromises()

        // Assert
        expect(summary.finalDestinationLocationId.value).toBe(5)
      } finally {
        scope.stop()
      }
    })

    test("when the authorization changes, exposes the newly loaded record", async () => {
      // Arrange
      const estimatedAuthorization = travelAuthorizationFactory.asShow().build({
        id: 1,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: null,
        travelSegments: [
          { isActual: false, arrivalLocationId: 2 },
          { isActual: true, arrivalLocationId: 3 },
        ],
      })
      const actualAuthorization = travelAuthorizationFactory.asShow().build({
        id: 2,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: TravelAuthorizationTripTypes.ONE_WAY,
        travelSegments: [
          { isActual: false, arrivalLocationId: 4 },
          { isActual: true, arrivalLocationId: 5 },
        ],
      })
      mockHttpClient()
        .get.mockResolvedValueOnce({ data: { travelAuthorization: estimatedAuthorization } })
        .mockResolvedValueOnce({ data: { travelAuthorization: actualAuthorization } })
      const travelAuthorizationId = ref(1)
      const scope = effectScope()
      const summary = scope.run(() => useTravelAuthorizationSummary(travelAuthorizationId))
      if (!summary) throw new Error("Summary did not initialize")

      try {
        // Act
        await flushPromises()
        travelAuthorizationId.value = 2
        await flushPromises()

        // Assert
        expect(summary.travelAuthorization.value).toEqual(actualAuthorization)
      } finally {
        scope.stop()
      }
    })
  })
})
