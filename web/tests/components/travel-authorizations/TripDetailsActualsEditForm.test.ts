import { flushPromises } from "@vue/test-utils"

import {
  type TravelAuthorizationAsShow,
  TravelAuthorizationTripTypes,
} from "@/api/travel-authorizations-api"
import {
  type TravelSegment,
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

import TripDetailsActualsEditForm from "@/components/travel-authorizations/TripDetailsActualsEditForm.vue"

describe("web/src/components/travel-authorizations/TripDetailsActualsEditForm.vue", () => {
  describe("TripDetailsActualsEditForm", () => {
    test("when the actual lookup succeeds empty, saves estimated legs as new actual rows", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        id: 41,
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: null,
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
      const estimatedSegments = [outboundSegment, returnSegment]
      const actualLookup = Promise.withResolvers<TravelSegment[]>()
      let hasCompletedActualLookup = false
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestinationLocationId: 4,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
      })
      const httpClient = mockHttpClient()
      mockEditorGetRoutes(travelAuthorization)
      mockTravelSegmentList(travelAuthorization.id, {
        isActual: true,
        loadTravelSegments: async () => {
          const travelSegments = await actualLookup.promise
          hasCompletedActualLookup = true
          return travelSegments
        },
      })
      mockTravelSegmentList(travelAuthorization.id, {
        isActual: false,
        loadTravelSegments: () => {
          if (hasCompletedActualLookup) return estimatedSegments

          throw new Error("Estimates were requested before the actual lookup completed")
        },
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

      // Act
      actualLookup.resolve([])
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()
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

    test.each([
      {
        outcome: "saved actuals exist",
        hasFailedActualLookup: false,
      },
      {
        outcome: "the actual lookup fails",
        hasFailedActualLookup: true,
      },
    ])("when $outcome, does not look up estimated legs", async ({ hasFailedActualLookup }) => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeActual: TravelAuthorizationTripTypes.ONE_WAY,
      })
      const httpClient = mockHttpClient()
      mockEditorGetRoutes(travelAuthorization)
      mockTravelSegmentList(travelAuthorization.id, {
        isActual: true,
        loadTravelSegments: () => {
          if (hasFailedActualLookup) {
            throw new Error("Actual itinerary unavailable")
          }

          const actualSegment = travelSegmentFactory.build({
            travelAuthorizationId: 5,
            segmentNumber: 1,
            departureLocationId: 1,
            arrivalLocationId: 2,
            departureOn: "2026-11-12",
            isActual: true,
          })
          return [actualSegment]
        },
      })
      const router = mockRouter()
      await router.push("/")

      // Act
      mountWithDefaultPlugins(TripDetailsActualsEditForm, {
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

      // Assert
      const segmentLookups = httpClient.get.mock.calls.filter(
        ([url]) => url === "/api/travel-segments"
      )
      expect(segmentLookups).toEqual([
        [
          "/api/travel-segments",
          expect.objectContaining({
            params: expect.objectContaining({
              where: {
                travelAuthorizationId: 5,
                isActual: true,
              },
              perPage: -1,
            }),
          }),
        ],
      ])
    })

    test("when the actual lookup fails, does not let a save replace existing actual rows", async () => {
      // Arrange
      const estimatedSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.ONE_WAY,
        tripTypeActual: TravelAuthorizationTripTypes.ONE_WAY,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
      })
      const httpClient = mockHttpClient()
      mockEditorGetRoutes(travelAuthorization)
      mockTravelSegmentList(travelAuthorization.id, {
        isActual: true,
        loadTravelSegments: () => {
          throw new Error("Actual itinerary unavailable")
        },
      })
      mockTravelSegmentList(travelAuthorization.id, {
        isActual: false,
        loadTravelSegments: () => [estimatedSegment],
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
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test.each([TravelAuthorizationTripTypes.ONE_WAY, TravelAuthorizationTripTypes.ROUND_TRIP])(
      "when reopening a %s trip, keeps the final accommodation",
      async (tripType) => {
        // Arrange
        const isRoundTrip = tripType === TravelAuthorizationTripTypes.ROUND_TRIP
        const finalLeg = travelSegmentFactory.build({
          travelAuthorizationId: 5,
          isActual: true,
          segmentNumber: isRoundTrip ? 2 : 1,
          departureLocationId: 2,
          arrivalLocationId: 1,
          departureOn: "2026-11-13",
          departureTime: "09:00",
          accommodationType: TravelSegmentAccommodationTypes.OTHER,
          accommodationTypeOther: "Staff housing",
        })
        const travelSegments = [finalLeg]
        if (isRoundTrip) {
          const outboundLeg = travelSegmentFactory.build({
            travelAuthorizationId: 5,
            isActual: true,
            segmentNumber: 1,
            departureLocationId: 1,
            arrivalLocationId: 2,
            departureOn: "2026-11-12",
            departureTime: "09:00",
            accommodationType: TravelSegmentAccommodationTypes.HOTEL,
          })
          travelSegments.unshift(outboundLeg)
        }
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          tripTypeActual: tripType,
          daysOffTravelStatusActual: 0,
          dateBackToWorkActual: "2026-11-14",
        })
        const httpClient = mockHttpClient()
        mockEditorGetRoutes(travelAuthorization)
        mockTravelSegmentList(travelAuthorization.id, {
          isActual: true,
          loadTravelSegments: () => travelSegments,
        })
        httpClient.patch.mockResolvedValue({
          data: {
            travelAuthorization,
            policy: {},
          },
        })
        const router = mockRouter()
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
        expect(httpClient.patch).toHaveBeenLastCalledWith(
          "/api/travel-authorizations/5",
          expect.objectContaining({
            travelSegmentActualsAttributes: expect.arrayContaining([
              expect.objectContaining({
                segmentNumber: finalLeg.segmentNumber,
                accommodationType: TravelSegmentAccommodationTypes.OTHER,
                accommodationTypeOther: "Staff housing",
              }),
            ]),
          })
        )
      }
    )

    test.each([TravelAuthorizationTripTypes.ROUND_TRIP, TravelAuthorizationTripTypes.MULTI_CITY])(
      "when a %s actual itinerary lacks outbound lodging, does not save it",
      async (tripType) => {
        // Arrange
        const outbound = travelSegmentFactory.build({
          travelAuthorizationId: 5,
          isActual: true,
          segmentNumber: 1,
          departureLocationId: 1,
          arrivalLocationId: 2,
          departureOn: "2026-11-12",
          departureTime: "09:00",
          accommodationType: null,
        })
        const inbound = travelSegmentFactory.build({
          travelAuthorizationId: 5,
          isActual: true,
          segmentNumber: 2,
          departureLocationId: 2,
          arrivalLocationId: 1,
          departureOn: "2026-11-13",
          departureTime: "09:00",
          accommodationType: TravelSegmentAccommodationTypes.PRIVATE,
        })
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          tripTypeActual: tripType,
          daysOffTravelStatusActual: 0,
          dateBackToWorkActual: "2026-11-14",
        })
        const httpClient = mockHttpClient()
        mockEditorGetRoutes(travelAuthorization)
        mockTravelSegmentList(travelAuthorization.id, {
          isActual: true,
          loadTravelSegments: () => [outbound, inbound],
        })
        const router = mockRouter()
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
        expect(httpClient.patch).not.toHaveBeenCalled()
      }
    )

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
      })
      const httpClient = mockHttpClient()
      mockEditorGetRoutes(travelAuthorization)
      mockTravelSegmentList(travelAuthorization.id, {
        isActual: true,
        loadTravelSegments: () => travelSegments,
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

    test("when the saved actual route exceeds the default page, saves every leg without resending Final Destination", async () => {
      // Arrange
      const defaultPageSize = 10
      const actualSegments = Array.from({ length: defaultPageSize + 1 }, (_, index) =>
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
      const ottawa = locationFactory.build({
        id: 8,
        city: "Ottawa",
        province: "ON",
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: null,
        finalDestinationLocationId: ottawa.id,
        finalDestination: ottawa,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
      })
      const httpClient = mockHttpClient()
      mockEditorGetRoutes(travelAuthorization)
      mockHttpGetRoute(
        "/api/travel-segments",
        (config) => ({
          travelSegments:
            config?.params?.page === 2
              ? actualSegments.slice(defaultPageSize)
              : actualSegments.slice(0, defaultPageSize),
          totalCount: actualSegments.length,
        }),
        {
          params: {
            where: {
              travelAuthorizationId: travelAuthorization.id,
              isActual: true,
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
      const expectedActualLegs = actualSegments.map((actualSegment) =>
        expect.objectContaining({
          segmentNumber: actualSegment.segmentNumber,
          departureLocationId: actualSegment.departureLocationId,
          arrivalLocationId: actualSegment.arrivalLocationId,
          accommodationType: TravelSegmentAccommodationTypes.HOTEL,
          isActual: true,
        })
      )
      expect(httpClient.patch).toHaveBeenLastCalledWith("/api/travel-authorizations/5", {
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: expectedActualLegs,
      })
    })
  })
})

function mockEditorGetRoutes(travelAuthorization: TravelAuthorizationAsShow) {
  mockHttpGetRoutes({
    [`/api/travel-authorizations/${travelAuthorization.id}`]: () => ({
      travelAuthorization,
      policy: {},
    }),
    "/api/locations": () => ({
      locations: [],
      totalCount: 0,
    }),
  })
}

function mockTravelSegmentList(
  travelAuthorizationId: number,
  {
    isActual,
    loadTravelSegments,
  }: {
    isActual: boolean
    loadTravelSegments: () => TravelSegment[] | Promise<TravelSegment[]>
  }
) {
  mockHttpGetRoute(
    "/api/travel-segments",
    async () => {
      const travelSegments = await loadTravelSegments()
      return {
        travelSegments,
        totalCount: travelSegments.length,
      }
    },
    {
      params: {
        where: {
          travelAuthorizationId,
          isActual,
        },
        perPage: -1,
      },
    }
  )
}
