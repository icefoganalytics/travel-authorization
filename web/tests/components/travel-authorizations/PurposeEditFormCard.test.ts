import { flushPromises, mount } from "@vue/test-utils"
import { VAutocomplete } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { TravelSegmentTravelMethods } from "@/api/travel-segments-api"

import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"

import { locationFactory, travelAuthorizationFactory } from "@/tests/factories"
import { mockHttpClient, mockVuetify } from "@/tests/support"

describe("web/src/components/travel-authorizations/PurposeEditFormCard.vue", () => {
  describe("PurposeEditFormCard", () => {
    test.each([
      { condition: "saved without changes", destinationLocationId: 3 },
      { condition: "saved with a new destination", destinationLocationId: 4 },
    ])(
      "when a closed multi-city itinerary is $condition, preserves its return home",
      async ({ destinationLocationId }) => {
        // Arrange
        const travelSegments = [
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 3 },
          { departureLocationId: 3, arrivalLocationId: 1 },
        ].map((locations, index) => ({
          ...locations,
          id: index + 1,
          travelAuthorizationId: 5,
          segmentNumber: index + 1,
          departureOn: "2026-11-12",
          departureTime: null,
          modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
          modeOfTransportOther: null,
          accommodationType: null,
          accommodationTypeOther: null,
          isActual: false,
          createdAt: "2026-11-01T00:00:00.000Z",
          updatedAt: "2026-11-01T00:00:00.000Z",
        }))
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          purposeId: 1,
          eventName: "Planning meeting",
          benefits: "Coordinate the regional program",
          allTravelWithinTerritory: false,
          tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
          travelSegments,
        })
        const whitehorse = locationFactory.build({ id: 1, city: "Whitehorse", province: "YT" })
        const vancouver = locationFactory.build({ id: 2, city: "Vancouver", province: "BC" })
        const toronto = locationFactory.build({ id: 3, city: "Toronto", province: "ON" })
        const ottawa = locationFactory.build({ id: 4, city: "Ottawa", province: "ON" })
        const locations = [whitehorse, vancouver, toronto, ottawa]
        const httpClient = mockHttpClient()
        httpClient.get.mockResolvedValue({
          data: {
            travelAuthorization,
            travelSegments,
            locations,
            travelPurposes: [{ id: 1, purpose: "Meeting" }],
            totalCount: 4,
            policy: {},
          },
        })
        httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
        const vuetify = mockVuetify()
        const wrapper = mount(PurposeEditFormCard, {
          props: { travelAuthorizationId: 5 },
          global: {
            plugins: [vuetify],
          },
        })
        await flushPromises()

        // Act
        if (destinationLocationId !== 3) {
          wrapper.getComponent(VAutocomplete).vm.$emit("update:modelValue", destinationLocationId)
          await flushPromises()
        }
        await wrapper.vm.save()
        await flushPromises()

        // Assert
        const expectedSegment1 = expect.objectContaining({
          segmentNumber: 1,
          departureLocationId: 1,
          arrivalLocationId: 2,
        })
        const expectedSegment2 = expect.objectContaining({
          segmentNumber: 2,
          departureLocationId: 2,
          arrivalLocationId: destinationLocationId,
        })
        const expectedSegment3 = expect.objectContaining({
          segmentNumber: 3,
          departureLocationId: destinationLocationId,
          arrivalLocationId: 1,
        })
        expect(httpClient.patch).toHaveBeenCalledWith(
          "/api/travel-authorizations/5",
          expect.objectContaining({
            travelSegmentEstimatesAttributes: [
              expectedSegment1,
              expectedSegment2,
              expectedSegment3,
            ],
          })
        )
      }
    )
  })
})
