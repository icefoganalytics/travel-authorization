import { flushPromises } from "@vue/test-utils"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import { travelAuthorizationFactory } from "@/tests/factories"
import {
  mockHttpClient,
  mockHttpGetRoutes,
  mockRouter,
  mountWithDefaultPlugins,
} from "@/tests/support"

import TravelSegmentsAttributesRoundTripSection from "@/components/travel-segments/TravelSegmentsAttributesRoundTripSection.vue"

import TripDetailsEstimatesEditForm from "@/components/travel-authorizations/TripDetailsEstimatesEditForm.vue"

describe("web/src/components/travel-authorizations/TripDetailsEstimatesEditForm.vue", () => {
  describe("TripDetailsEstimatesEditForm", () => {
    test("when the saved trip type is missing, a route query cannot authorize saving", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: null,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments: [], totalCount: 0 }),
      })
      const router = mockRouter()
      await router.push("/?trip_type=round_trip")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when no legs have been seeded by Purpose, initializes an editable round trip", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.ROUND_TRIP,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments: [], totalCount: 0 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })

      // Act
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Assert
      const itinerarySection = wrapper.getComponent(TravelSegmentsAttributesRoundTripSection)
      const initializedSegments = itinerarySection.emitted("updated")?.at(-1)?.[0]
      const expectedOutbound = expect.objectContaining({
        segmentNumber: 1,
        departureLocationId: null,
        arrivalLocationId: null,
      })
      const expectedReturn = expect.objectContaining({
        segmentNumber: 2,
        departureLocationId: null,
        arrivalLocationId: null,
      })
      expect(initializedSegments).toEqual([expectedOutbound, expectedReturn])
    })
  })
})
