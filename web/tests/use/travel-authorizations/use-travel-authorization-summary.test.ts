import { flushPromises } from "@vue/test-utils"
import { effectScope, ref } from "vue"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/tests/factories"
import { mockHttpClient } from "@/tests/support"

import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"

describe("web/src/use/travel-authorizations/use-travel-authorization-summary.ts", () => {
  describe("useTravelAuthorizationSummary", () => {
    test("when destinations differ, uses the server destination", async () => {
      // Arrange
      const finalDestination = locationFactory.build({ id: 8 })
      const outboundSegment = travelSegmentFactory.build({
        isActual: false,
        departureLocationId: 1,
        arrivalLocationId: 2,
      })
      const returnSegment = travelSegmentFactory.build({
        isActual: false,
        departureLocationId: 2,
        arrivalLocationId: 1,
      })
      const estimatedAuthorization = travelAuthorizationFactory.asShow().build({
        id: 1,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: null,
        finalDestination,
        travelSegments: [outboundSegment, returnSegment],
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
        expect(summary.finalDestinationLocationId.value).toBe(8)
      } finally {
        scope.stop()
      }
    })

    test("when the authorization changes, uses its new server destination", async () => {
      // Arrange
      const estimatedDestination = locationFactory.build({ id: 2 })
      const actualDestination = locationFactory.build({ id: 6 })
      const actualSegment = travelSegmentFactory.build({
        isActual: true,
        departureLocationId: 1,
        arrivalLocationId: 5,
      })
      const estimatedAuthorization = travelAuthorizationFactory.asShow().build({
        id: 1,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: null,
        finalDestination: estimatedDestination,
      })
      const actualAuthorization = travelAuthorizationFactory.asShow().build({
        id: 2,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestination: actualDestination,
        travelSegments: [actualSegment],
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
        expect(summary.finalDestinationLocationId.value).toBe(6)
      } finally {
        scope.stop()
      }
    })

    test("when the server destination is absent, does not infer it", async () => {
      // Arrange
      const travelSegment = travelSegmentFactory.build({
        isActual: false,
        departureLocationId: 1,
        arrivalLocationId: 2,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 1,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        finalDestination: null,
        travelSegments: [travelSegment],
      })
      mockHttpClient().get.mockResolvedValue({
        data: { travelAuthorization },
      })
      const travelAuthorizationId = ref(1)
      const scope = effectScope()
      const summary = scope.run(() => useTravelAuthorizationSummary(travelAuthorizationId))
      if (!summary) throw new Error("Summary did not initialize")

      try {
        // Act
        await flushPromises()

        // Assert
        expect(summary.finalDestinationLocationId.value).toBeNull()
      } finally {
        scope.stop()
      }
    })
  })
})
