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
import TripDetailsActualsEditForm from "@/components/travel-authorizations/TripDetailsActualsEditForm.vue"

describe("web/src/components/travel-authorizations/TripDetailsActualsEditForm.vue", () => {
  describe("TripDetailsActualsEditForm", () => {
    test("when the destination is deliberately changed, saves the new city independently of the route", async () => {
      // Arrange
      const segment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        isActual: true,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeActual: TravelAuthorizationTripTypes.ONE_WAY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
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
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
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
        tripTypeActual: TravelAuthorizationTripTypes.ONE_WAY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: [omit(segment, ["id", "createdAt", "updatedAt"])],
      })
    })

    test("when estimates seed new actual rows, does not send estimated segment identities", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        id: 41,
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const returnSegment = travelSegmentFactory.build({
        id: 42,
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
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
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
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      const expectedActualSegments = travelSegments.map((segment, index) => {
        const attributes = omit(segment, ["id", "createdAt", "updatedAt"])
        return {
          ...attributes,
          isActual: true,
          segmentNumber: index + 1,
        }
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 4,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: expectedActualSegments,
      })
    })

    test("when an actual leg has no arrival city, does not save the incomplete itinerary", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        isActual: true,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: null,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const returnSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        isActual: true,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        departureOn: "2026-11-13",
        departureTime: "09:00",
      })
      const travelSegments = [outboundSegment, returnSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
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
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
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

    test("when more than ten mixed-phase legs exist, saves every actual leg", async () => {
      // Arrange
      const estimatedSegments = Array.from({ length: 6 }, (_, index) =>
        travelSegmentFactory.build({
          travelAuthorizationId: 5,
          segmentNumber: index + 1,
          departureLocationId: 1,
          arrivalLocationId: 2,
          departureOn: "2026-11-12",
          departureTime: "09:00",
          accommodationType: TravelSegmentAccommodationTypes.HOTEL,
          isActual: false,
        })
      )
      const actualSegments = Array.from({ length: 6 }, (_, index) =>
        travelSegmentFactory.build({
          travelAuthorizationId: 5,
          segmentNumber: index + 1,
          departureLocationId: 1,
          arrivalLocationId: 3,
          departureOn: "2026-11-12",
          departureTime: "09:00",
          accommodationType: TravelSegmentAccommodationTypes.HOTEL,
          isActual: true,
        })
      )
      const travelSegments = estimatedSegments.flatMap((estimatedSegment, index) => {
        return [estimatedSegment, actualSegments[index]]
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({
          travelAuthorization,
          policy: {},
        }),
        "/api/travel-segments": (config) => {
          const pageSize = config?.params?.perPage === -1 ? travelSegments.length : 10
          const paginatedSegments = travelSegments.slice(0, pageSize)
          return {
            travelSegments: paginatedSegments,
            totalCount: travelSegments.length,
          }
        },
        "/api/locations": () => ({
          locations: [],
          totalCount: 0,
        }),
      })
      httpClient.patch.mockResolvedValue({
        data: {
          travelAuthorization,
          policy: {},
        },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: {
          travelAuthorizationId: 5,
        },
        global: {
          plugins: [router],
        },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      const expectedActualSegments = actualSegments.map((segment, index) => {
        const attributes = omit(segment, ["id", "createdAt", "updatedAt"])
        return {
          ...attributes,
          accommodationType: index === 5 ? null : TravelSegmentAccommodationTypes.HOTEL,
        }
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 4,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: expectedActualSegments,
      })
    })
  })
})
