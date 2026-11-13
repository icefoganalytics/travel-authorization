import { flushPromises } from "@vue/test-utils"
import { effectScope, ref } from "vue"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { travelAuthorizationFactory } from "@/tests/factories"
import { mockHttpClient } from "@/tests/support"

import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"

describe("web/src/use/travel-authorizations/use-travel-authorization-summary.ts", () => {
  describe("useTravelAuthorizationSummary", () => {
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
