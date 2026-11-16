import { flushPromises } from "@vue/test-utils"
import { omit } from "lodash"
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

import TripTypeRadioGroup from "@/components/travel-authorizations/TripTypeRadioGroup.vue"
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
        const attributes = omit(segment, ["createdAt", "updatedAt"])
        return {
          ...attributes,
          segmentNumber: index + 1,
          accommodationType: index === 2 ? null : TravelSegmentAccommodationTypes.HOTEL,
        }
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        estimatedPrimaryDestinationId: null,
        travelDurationEstimate: 1,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: expectedSegments,
      })
    })

    test("when an earlier arrival is selected, saves its estimate city without changing endpoints", async () => {
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
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 2)
      await flushPromises()
      await wrapper.vm.save()

      // Assert
      const expectedSegment1 = omit(travelSegment1, ["createdAt", "updatedAt"])
      const expectedSegment2 = omit(travelSegment2, ["createdAt", "updatedAt"])
      const expectedSegment3 = omit(travelSegment3, ["createdAt", "updatedAt"])
      expectedSegment3.accommodationType = null
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        estimatedPrimaryDestinationId: 2,
        travelDurationEstimate: 1,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [expectedSegment1, expectedSegment2, expectedSegment3],
      })
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

    test("when saving a round trip, defaults to the outbound city", async () => {
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
      const expectedOutbound = omit(outboundSegment, ["createdAt", "updatedAt"])
      const expectedReturn = omit(returnSegment, ["createdAt", "updatedAt"])
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        tripTypeEstimate: TravelAuthorizationTripTypes.ROUND_TRIP,
        estimatedPrimaryDestinationId: 2,
        travelDurationEstimate: 2,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [expectedOutbound, expectedReturn],
      })
    })

    test("when saving a one-way trip, defaults to its arrival city", async () => {
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
      const expectedOutbound = omit(outboundSegment, ["createdAt", "updatedAt"])
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        estimatedPrimaryDestinationId: 2,
        travelDurationEstimate: 1,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [expectedOutbound],
      })
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
      })
      const expectedReturn = expect.objectContaining({
        segmentNumber: 2,
        departureLocationId: null,
        arrivalLocationId: null,
      })
      expect(initializedSegments).toEqual([expectedOutbound, expectedReturn])
    })

    test.each([
      { condition: "without a new choice", selectedCity: null },
      { condition: "with a new explicit city", selectedCity: 2 },
    ])("when multi-city $condition, saves the explicit choice", async (scenario) => {
      const { selectedCity } = scenario

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
        departureOn: "2026-11-12",
        departureTime: "09:00",
      })
      const travelSegments = [outboundSegment, returnSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.ROUND_TRIP,
        estimatedPrimaryDestinationId: 2,
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
      const router = mockRouter([
        {
          path: "/",
          name: "TripDetailsEstimatesEditFormTest",
          component: TripDetailsEstimatesEditForm,
        },
      ])
      await router.push("/")
      await router.isReady()
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      wrapper
        .getComponent(TripTypeRadioGroup)
        .vm.$emit("update:modelValue", TravelAuthorizationTripTypes.MULTI_CITY)
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()
      if (selectedCity !== null) {
        wrapper.getComponent(VSelect).vm.$emit("update:modelValue", selectedCity)
        await flushPromises()
      }
      await wrapper.vm.save()

      // Assert
      const expectedOutbound = omit(outboundSegment, ["createdAt", "updatedAt"])
      const expectedReturn = omit(returnSegment, ["createdAt", "updatedAt"])
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        estimatedPrimaryDestinationId: selectedCity,
        travelDurationEstimate: 1,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [expectedOutbound, expectedReturn],
      })
    })

    test("when itinerary loading finishes after authorization loading, preserves the saved destination", async () => {
      // Arrange
      const firstSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        isActual: false,
      })
      const secondSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        isActual: false,
      })
      const travelSegments = [firstSegment, secondSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        estimatedPrimaryDestinationId: 2,
        travelSegments,
      })
      const { promise: segmentsReady, resolve: releaseSegments } = Promise.withResolvers<void>()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": async () => {
          await segmentsReady
          return { travelSegments, totalCount: 2 }
        },
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
      releaseSegments()
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Assert
      const primaryDestination = wrapper.getComponent(VSelect)
      expect(primaryDestination.props("modelValue")).toBe(2)
    })
  })
})
