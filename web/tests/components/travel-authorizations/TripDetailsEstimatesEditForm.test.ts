import { flushPromises } from "@vue/test-utils"
import { VSelect } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { TravelSegmentAccommodationTypes } from "@/api/travel-segments-api"

import { travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import {
  mockHttpClient,
  mockHttpGetRoutes,
  mockRouter,
  mountWithDefaultPlugins,
} from "@/tests/support"

import TripDetailsEstimatesEditForm from "@/components/travel-authorizations/TripDetailsEstimatesEditForm.vue"
import TravelSegmentsAttributesRoundTripSection from "@/components/travel-segments/TravelSegmentsAttributesRoundTripSection.vue"

describe("web/src/components/travel-authorizations/TripDetailsEstimatesEditForm.vue", () => {
  describe("TripDetailsEstimatesEditForm", () => {
    test("when a multi-city draft has no selection, saves without confirming an inferred arrival", async () => {
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
      await wrapper.vm.save()

      // Assert
      const expectedSegment = expect.objectContaining({
        isActual: false,
        isPrimaryDestination: false,
      })
      const expectedAttributes = expect.objectContaining({
        travelSegmentEstimatesAttributes: [expectedSegment, expectedSegment, expectedSegment],
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", expectedAttributes)
    })

    test("when an earlier arrival is selected, saves its estimate marker without changing endpoints", async () => {
      // Arrange
      const travelSegment1 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const travelSegment2 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 3,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const travelSegment3 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 3,
        departureLocationId: 3,
        arrivalLocationId: 1,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const travelSegments = [travelSegment1, travelSegment2, travelSegment3]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 3 }),
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
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 0)
      await flushPromises()
      await wrapper.vm.save()

      // Assert
      const expectedSegment1 = expect.objectContaining({
        departureLocationId: 1,
        arrivalLocationId: 2,
        isActual: false,
        isPrimaryDestination: true,
      })
      const expectedSegment2 = expect.objectContaining({
        departureLocationId: 2,
        arrivalLocationId: 3,
        isActual: false,
        isPrimaryDestination: false,
      })
      const expectedSegment3 = expect.objectContaining({
        departureLocationId: 3,
        arrivalLocationId: 1,
        isActual: false,
        isPrimaryDestination: false,
      })
      const expectedAttributes = expect.objectContaining({
        travelSegmentEstimatesAttributes: [expectedSegment1, expectedSegment2, expectedSegment3],
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", expectedAttributes)
    })

    test("when an empty round trip is opened, previews no destination", async () => {
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
      const destinationUpdate = wrapper.emitted("update:primaryDestinationLocationId")?.at(-1)
      expect(destinationUpdate).toEqual([null])
    })

    test("when saving a round trip, automatically marks only the outbound arrival", async () => {
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
      await wrapper.vm.save()

      // Assert
      const expectedOutbound = expect.objectContaining({
        id: outboundSegment.id,
        isActual: false,
        isPrimaryDestination: true,
      })
      const expectedReturn = expect.objectContaining({
        id: returnSegment.id,
        isActual: false,
        isPrimaryDestination: false,
      })
      const expectedAttributes = expect.objectContaining({
        travelSegmentEstimatesAttributes: [expectedOutbound, expectedReturn],
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", expectedAttributes)
    })

    test("when saving a one-way trip, automatically marks its arrival", async () => {
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
      await wrapper.vm.save()

      // Assert
      const expectedOutbound = expect.objectContaining({
        id: outboundSegment.id,
        isActual: false,
        isPrimaryDestination: true,
      })
      const expectedAttributes = expect.objectContaining({
        travelSegmentEstimatesAttributes: [expectedOutbound],
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", expectedAttributes)
    })

    test("when no legs have been seeded by Purpose, initializes an editable round trip", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({ id: 5 })
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
        isPrimaryDestination: false,
      })
      const expectedReturn = expect.objectContaining({
        segmentNumber: 2,
        departureLocationId: null,
        arrivalLocationId: null,
        isPrimaryDestination: false,
      })
      expect(initializedSegments).toEqual([expectedOutbound, expectedReturn])
    })
  })
})
