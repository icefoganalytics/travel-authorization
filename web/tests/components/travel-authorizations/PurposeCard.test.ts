import { flushPromises } from "@vue/test-utils"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/tests/factories"
import { mockHttpGetRoutes, mountWithDefaultPlugins } from "@/tests/support"

import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"
import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"

describe("web/src/components/travel-authorizations/PurposeCard.vue", () => {
  describe("PurposeCard", () => {
    test("when the server returns a saved destination, displays it rather than recomputing the route", async () => {
      // Arrange
      const finalDestination = locationFactory.build({ id: 4, city: "Ottawa", province: "ON" })
      const arrival = locationFactory.build({ id: 2, city: "Vancouver", province: "BC" })
      const leg = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: arrival.id,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        finalDestination,
        finalDestinationLocationId: finalDestination.id,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        travelSegments: [leg],
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations/2": () => ({ location: arrival }),
        "/api/locations/4": () => ({ location: finalDestination }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeCard, {
        props: { travelAuthorizationId: 5 },
      })

      // Act
      await flushPromises()

      // Assert
      const destination = wrapper.getComponent(LocationDescriptionElement)
      expect(destination.get("dd").text()).toBe("Ottawa (ON)")
    })

    test("when the saved destination is absent, does not infer a destination from itinerary arrivals", async () => {
      // Arrange
      const arrival = locationFactory.build({ id: 2, city: "Vancouver", province: "BC" })
      const leg = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: arrival.id,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        finalDestination: null,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        travelSegments: [leg],
        finalDestinationLocationId: null,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations/2": () => ({ location: arrival }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeCard, {
        props: { travelAuthorizationId: 5 },
      })

      // Act
      await flushPromises()

      // Assert
      const destination = wrapper.getComponent(LocationDescriptionElement)
      expect(destination.get("dd").text()).toBe("")
    })
  })
})
