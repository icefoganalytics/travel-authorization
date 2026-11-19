import { flushPromises } from "@vue/test-utils"
import { omit } from "lodash"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { TravelSegmentAccommodationTypes } from "@/api/travel-segments-api"

import { travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import {
  mockHttpClient,
  mockHttpGetRoutes,
  mockRouter,
  mountWithDefaultPlugins,
} from "@/tests/support"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
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
      expect(wrapper.get('[role="alert"]').text()).toContain(
        "This request has no estimated trip type"
      )
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when the destination is deliberately changed, saves the new city independently of the route", async () => {
      // Arrange
      const segment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        isActual: false,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegments: [segment],
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments: [segment], totalCount: 1 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      wrapper.getComponent(LocationsAutocomplete).vm.$emit("update:modelValue", 7)
      await flushPromises()
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 7,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        travelDurationEstimate: 1,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [omit(segment, ["id", "createdAt", "updatedAt"])],
      })
    })

    test("when saving a multi-city itinerary, does not require another destination choice", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, {
        travelAuthorizationId: 5,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
        departureLocationId: 1,
        arrivalLocationId: 2,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 3 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      httpClient.patch.mockResolvedValue({
        data: {
          travelAuthorization,
          policy: {},
        },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      const expectedSegments = travelSegments.map((segment, index) => {
        const attributes = omit(segment, ["id", "createdAt", "updatedAt"])
        return {
          ...attributes,
          segmentNumber: index + 1,
          accommodationType: index === 2 ? null : TravelSegmentAccommodationTypes.HOTEL,
        }
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 4,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationEstimate: 1,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: expectedSegments,
      })
    })

    test("when an estimated leg has no arrival city, does not save the incomplete itinerary", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: null,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const returnSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        departureOn: "2026-11-13",
        departureTime: "09:00",
      })
      const travelSegments = [outboundSegment, returnSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 2 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when saving a round trip, leaves the early destination choice unchanged", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const returnSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        departureOn: "2026-11-13",
        departureTime: "09:00",
      })
      const travelSegments = [outboundSegment, returnSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.ROUND_TRIP,
        finalDestinationLocationId: 4,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 2 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      httpClient.patch.mockResolvedValue({
        data: {
          travelAuthorization,
          policy: {},
        },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      const expectedOutbound = omit(outboundSegment, ["id", "createdAt", "updatedAt"])
      const expectedReturn = omit(returnSegment, ["id", "createdAt", "updatedAt"])
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 4,
        tripTypeEstimate: TravelAuthorizationTripTypes.ROUND_TRIP,
        travelDurationEstimate: 2,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [expectedOutbound, expectedReturn],
      })
    })

    test("when saving a one-way trip, leaves the early destination choice unchanged", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
      })
      const travelSegments = [outboundSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 1 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      httpClient.patch.mockResolvedValue({
        data: {
          travelAuthorization,
          policy: {},
        },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      const expectedOutbound = omit(outboundSegment, ["id", "createdAt", "updatedAt"])
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 4,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        travelDurationEstimate: 1,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [expectedOutbound],
      })
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
