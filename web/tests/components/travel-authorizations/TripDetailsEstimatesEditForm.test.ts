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
  mockHttpGetRoute,
  mockHttpGetRoutes,
  mockRouter,
  mountWithDefaultPlugins,
} from "@/tests/support"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelSegmentsAttributesMultiCityTripSection from "@/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue"

import TripDetailsEstimatesEditForm from "@/components/travel-authorizations/TripDetailsEstimatesEditForm.vue"

describe("web/src/components/travel-authorizations/TripDetailsEstimatesEditForm.vue", () => {
  describe("TripDetailsEstimatesEditForm", () => {
    test("when an estimated leg is added without an arrival city, does not save the incomplete itinerary", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
        isActual: false,
      })
      const returnSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        departureOn: "2026-11-13",
        departureTime: "09:00",
        isActual: false,
      })
      const travelSegments = [outboundSegment, returnSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      mockHttpGetRoute(
        "/api/travel-segments",
        () => ({
          travelSegments,
          totalCount: travelSegments.length,
        }),
        {
          params: {
            where: {
              travelAuthorizationId: 5,
              isActual: false,
            },
            perPage: -1,
          },
        }
      )
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
      const routeEditor = wrapper.getComponent(TravelSegmentsAttributesMultiCityTripSection)
      const addLegButton = routeEditor
        .findAll("button")
        .find((button) => button.text().includes("Add Leg"))
      if (!addLegButton) {
        throw new Error("Missing Add Leg button")
      }

      await addLegButton.trigger("click")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when editing a multi-city itinerary, saves the route without changing Final Destination", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
        isActual: false,
      })
      const returnSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        departureOn: "2026-11-13",
        departureTime: "09:00",
        isActual: false,
      })
      const travelSegments = [outboundSegment, returnSegment]
      const whitehorse = locationFactory.build({
        id: 1,
        city: "Whitehorse",
        province: "YT",
      })
      const vancouver = locationFactory.build({
        id: 2,
        city: "Vancouver",
        province: "BC",
      })
      const dawsonCity = locationFactory.build({
        id: 3,
        city: "Dawson City",
        province: "YT",
      })
      const ottawa = locationFactory.build({
        id: 4,
        city: "Ottawa",
        province: "ON",
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: ottawa.id,
        finalDestination: ottawa,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({
          travelAuthorization,
          policy: {},
        }),
        "/api/locations": () => ({
          locations: [whitehorse, vancouver, dawsonCity, ottawa],
          totalCount: 4,
        }),
      })
      mockHttpGetRoute(
        "/api/travel-segments",
        () => ({
          travelSegments,
          totalCount: travelSegments.length,
        }),
        {
          params: {
            where: {
              travelAuthorizationId: 5,
              isActual: false,
            },
            perPage: -1,
          },
        }
      )
      httpClient.patch.mockResolvedValue({
        data: {
          travelAuthorization,
          policy: {},
        },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsEstimatesEditForm, {
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
      const routeEditor = wrapper.getComponent(TravelSegmentsAttributesMultiCityTripSection)
      const firstLegDeparture = routeEditor.getComponent(LocationsAutocomplete)
      firstLegDeparture.vm.$emit("update:modelValue", 3)
      await flushPromises()
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenLastCalledWith("/api/travel-authorizations/5", {
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationEstimate: 2,
        daysOffTravelStatusEstimate: 0,
        dateBackToWorkEstimate: "2026-11-14",
        travelSegmentEstimatesAttributes: [
          {
            travelAuthorizationId: 5,
            segmentNumber: 1,
            departureLocationId: 3,
            arrivalLocationId: 2,
            departureOn: "2026-11-12",
            departureTime: "09:00",
            modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
            modeOfTransportOther: null,
            accommodationType: TravelSegmentAccommodationTypes.HOTEL,
            accommodationTypeOther: null,
            isActual: false,
          },
          {
            travelAuthorizationId: 5,
            segmentNumber: 2,
            departureLocationId: 2,
            arrivalLocationId: 1,
            departureOn: "2026-11-13",
            departureTime: "09:00",
            modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
            modeOfTransportOther: null,
            accommodationType: null,
            accommodationTypeOther: null,
            isActual: false,
          },
        ],
      })
    })
  })
})
