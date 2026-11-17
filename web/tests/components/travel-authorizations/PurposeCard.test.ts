import { flushPromises } from "@vue/test-utils"

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
      const primaryDestination = locationFactory.build({ id: 4, city: "Ottawa" })
      const travelSegments = travelSegmentFactory.buildList(2, {
        arrivalLocationId: 2,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        primaryDestination,
        estimatedPrimaryDestinationId: 2,
        travelSegments,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations/4": () => ({ location: primaryDestination }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeCard, {
        props: { travelAuthorizationId: 5 },
      })

      // Act
      await flushPromises()

      // Assert
      const destination = wrapper.getComponent(LocationDescriptionElement)
      expect(destination.props("locationId")).toBe(4)
    })

    test("when the saved destination is absent, does not infer a destination from itinerary arrivals", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(2, {
        arrivalLocationId: 2,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        primaryDestination: null,
        travelSegments,
        estimatedPrimaryDestinationId: 2,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeCard, {
        props: { travelAuthorizationId: 5 },
      })

      // Act
      await flushPromises()

      // Assert
      const destination = wrapper.getComponent(LocationDescriptionElement)
      expect(destination.props("locationId")).toBeNull()
    })
  })
})
