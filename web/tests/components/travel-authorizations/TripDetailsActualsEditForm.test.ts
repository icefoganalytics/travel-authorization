import { flushPromises } from "@vue/test-utils"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import {
  TravelSegmentAccommodationTypes,
  TravelSegmentTravelMethods,
} from "@/api/travel-segments-api"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/tests/factories"
import {
  mockHttpClient,
  mockHttpGetRoutes,
  mockRouter,
  mountWithDefaultPlugins,
} from "@/tests/support"

import TripDetailsActualsEditForm from "@/components/travel-authorizations/TripDetailsActualsEditForm.vue"

describe("web/src/components/travel-authorizations/TripDetailsActualsEditForm.vue", () => {
  describe("TripDetailsActualsEditForm", () => {
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
        "/api/travel-authorizations/5": () => ({
          travelAuthorization,
          policy: {},
        }),
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
      expect(httpClient.patch).toHaveBeenLastCalledWith("/api/travel-authorizations/5", {
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: [
          {
            travelAuthorizationId: 5,
            segmentNumber: 1,
            departureLocationId: 1,
            arrivalLocationId: 2,
            departureOn: "2026-11-12",
            departureTime: "09:00",
            modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
            modeOfTransportOther: null,
            accommodationType: TravelSegmentAccommodationTypes.HOTEL,
            accommodationTypeOther: null,
            isActual: true,
          },
          {
            travelAuthorizationId: 5,
            segmentNumber: 2,
            departureLocationId: 2,
            arrivalLocationId: 1,
            departureOn: "2026-11-12",
            departureTime: "09:00",
            modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
            modeOfTransportOther: null,
            accommodationType: null,
            accommodationTypeOther: null,
            isActual: true,
          },
        ],
      })
    })

    test("when days on non-travel status are negative, does not save the actual itinerary", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        isActual: true,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
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
        "/api/travel-authorizations/5": () => ({
          travelAuthorization,
          policy: {},
        }),
        "/api/locations": () => ({
          locations: [],
          totalCount: 0,
        }),
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
      const daysOffTravelStatus = wrapper.get<HTMLInputElement>('input[type="number"]')
      await daysOffTravelStatus.setValue("-1")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when more than ten mixed-phase legs exist, saves every actual leg without resending Final Destination", async () => {
      // Arrange
      const estimatedSegments = Array.from({ length: 6 }, (_, index) =>
        travelSegmentFactory.build({
          travelAuthorizationId: 5,
          segmentNumber: index + 1,
          departureLocationId: index + 11,
          arrivalLocationId: index + 12,
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
          departureLocationId: index + 1,
          arrivalLocationId: index + 2,
          departureOn: "2026-11-12",
          departureTime: "09:00",
          accommodationType: TravelSegmentAccommodationTypes.HOTEL,
          isActual: true,
        })
      )
      const travelSegments = estimatedSegments.flatMap((estimatedSegment, index) => {
        return [estimatedSegment, actualSegments[index]]
      })
      const ottawa = locationFactory.build({
        id: 8,
        city: "Ottawa",
        province: "ON",
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: ottawa.id,
        finalDestination: ottawa,
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
      expect(httpClient.patch).toHaveBeenLastCalledWith("/api/travel-authorizations/5", {
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: [
          expect.objectContaining({
            segmentNumber: 1,
            departureLocationId: 1,
            arrivalLocationId: 2,
            isActual: true,
          }),
          expect.objectContaining({
            segmentNumber: 2,
            departureLocationId: 2,
            arrivalLocationId: 3,
            isActual: true,
          }),
          expect.objectContaining({
            segmentNumber: 3,
            departureLocationId: 3,
            arrivalLocationId: 4,
            isActual: true,
          }),
          expect.objectContaining({
            segmentNumber: 4,
            departureLocationId: 4,
            arrivalLocationId: 5,
            isActual: true,
          }),
          expect.objectContaining({
            segmentNumber: 5,
            departureLocationId: 5,
            arrivalLocationId: 6,
            isActual: true,
          }),
          expect.objectContaining({
            segmentNumber: 6,
            departureLocationId: 6,
            arrivalLocationId: 7,
            isActual: true,
            accommodationType: null,
          }),
        ],
      })
    })
  })
})
