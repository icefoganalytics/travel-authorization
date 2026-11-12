import { flushPromises, mount } from "@vue/test-utils"
import { VSelect } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import TripDetailsEstimatesEditForm from "@/components/travel-authorizations/TripDetailsEstimatesEditForm.vue"
import TravelSegmentsAttributesRoundTripSection from "@/components/travel-segments/TravelSegmentsAttributesRoundTripSection.vue"

import { travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

describe("web/src/components/travel-authorizations/TripDetailsEstimatesEditForm.vue", () => {
  describe("TripDetailsEstimatesEditForm", () => {
    test.each([
      {
        condition: "unconfirmed multi-city",
        tripType: TravelAuthorizationTripTypes.MULTI_CITY,
        chooseEarlier: false,
        expectedMarker: [false, false, false],
      },
      {
        condition: "earlier multi-city arrival chosen",
        tripType: TravelAuthorizationTripTypes.MULTI_CITY,
        chooseEarlier: true,
        expectedMarker: [true, false, false],
      },
      {
        condition: "round trip",
        tripType: TravelAuthorizationTripTypes.ROUND_TRIP,
        chooseEarlier: false,
        expectedMarker: [true, false],
      },
      {
        condition: "one way",
        tripType: TravelAuthorizationTripTypes.ONE_WAY,
        chooseEarlier: false,
        expectedMarker: [true],
      },
    ])(
      "when saving $condition, posts the phase's destination flags",
      async ({ tripType, chooseEarlier, expectedMarker }) => {
        // Arrange
        let route = [
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 3 },
          { departureLocationId: 3, arrivalLocationId: 1 },
        ]
        if (tripType === TravelAuthorizationTripTypes.ROUND_TRIP) {
          route = [
            { departureLocationId: 1, arrivalLocationId: 2 },
            { departureLocationId: 2, arrivalLocationId: 1 },
          ]
        } else if (tripType === TravelAuthorizationTripTypes.ONE_WAY) {
          route = [{ departureLocationId: 1, arrivalLocationId: 2 }]
        }
        const travelSegments = route.map((locations, index) =>
          travelSegmentFactory.build({
            ...locations,
            segmentNumber: index + 1,
            departureTime: "09:00",
          })
        )
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          tripTypeEstimate: tripType,
          daysOffTravelStatusEstimate: 0,
          dateBackToWorkEstimate: "2026-11-14",
          travelSegments,
        })
        const httpClient = mockHttpClient()
        httpClient.get.mockResolvedValue({
          data: {
            travelAuthorization,
            travelSegments,
            locations: [],
            totalCount: travelSegments.length,
          },
        })
        httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
        const router = mockRouter()
        await router.push("/")
        const wrapper = mount(TripDetailsEstimatesEditForm, {
          props: { travelAuthorizationId: 5 },
          global: {
            plugins: [router, mockVuetify()],
          },
        })
        await flushPromises()
        await vi.dynamicImportSettled()
        await flushPromises()

        // Act
        if (chooseEarlier) {
          wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 0)
          await flushPromises()
        }
        await wrapper.vm.save()

        // Assert
        expect(httpClient.patch).toHaveBeenCalledWith(
          "/api/travel-authorizations/5",
          expect.objectContaining({
            travelSegmentEstimatesAttributes: expectedMarker.map((isPrimaryDestination) => {
              return expect.objectContaining({ isActual: false, isPrimaryDestination })
            }),
          })
        )
      }
    )

    test("when Purpose has not seeded any legs, initializes an editable round trip", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({ id: 5 })
      mockHttpClient().get.mockResolvedValue({
        data: { travelAuthorization, travelSegments: [], locations: [], totalCount: 0 },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mount(TripDetailsEstimatesEditForm, {
        props: { travelAuthorizationId: 5 },
        global: {
          plugins: [router, mockVuetify()],
        },
      })

      // Act
      await flushPromises()

      // Assert
      const itinerarySection = wrapper.getComponent(TravelSegmentsAttributesRoundTripSection)
      const initializedSegments = itinerarySection.emitted("updated")?.at(-1)?.[0]
      expect(initializedSegments).toEqual([
        expect.objectContaining({
          segmentNumber: 1,
          departureLocationId: null,
          arrivalLocationId: null,
          isPrimaryDestination: false,
        }),
        expect.objectContaining({
          segmentNumber: 2,
          departureLocationId: null,
          arrivalLocationId: null,
          isPrimaryDestination: false,
        }),
      ])
    })
  })
})
