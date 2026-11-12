import { flushPromises, mount } from "@vue/test-utils"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"
import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"

import { travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import { mockHttpClient, mockVuetify } from "@/tests/support"

describe("web/src/components/travel-authorizations/PurposeCard.vue", () => {
  describe("PurposeCard", () => {
    test.each([
      {
        condition: "unconfirmed estimates",
        isActual: false,
        marked: false,
        expectedLocationId: null,
      },
      { condition: "confirmed estimates", isActual: false, marked: true, expectedLocationId: 2 },
      { condition: "confirmed actuals", isActual: true, marked: true, expectedLocationId: 4 },
    ])(
      "when displaying $condition, reads only the active phase's marked arrival",
      async ({ isActual, marked, expectedLocationId }) => {
        // Arrange
        const travelSegments = [
          travelSegmentFactory.build({
            departureLocationId: 1,
            arrivalLocationId: 2,
            isPrimaryDestination: marked,
          }),
          travelSegmentFactory.build({
            departureLocationId: 2,
            arrivalLocationId: 1,
          }),
          travelSegmentFactory.build({
            departureLocationId: 1,
            arrivalLocationId: 4,
            isActual: true,
            isPrimaryDestination: true,
          }),
          travelSegmentFactory.build({
            departureLocationId: 4,
            arrivalLocationId: 1,
            isActual: true,
          }),
        ]
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
          travelSegments,
        })
        if (isActual) {
          travelAuthorization.tripTypeActual = TravelAuthorizationTripTypes.MULTI_CITY
        }
        mockHttpClient().get.mockResolvedValue({
          data: { travelAuthorization, travelSegments, totalCount: 4 },
        })
        const wrapper = mount(PurposeCard, {
          props: { travelAuthorizationId: 5 },
          global: {
            plugins: [mockVuetify()],
          },
        })

        // Act
        await flushPromises()

        // Assert
        expect(wrapper.getComponent(LocationDescriptionElement).props("locationId")).toBe(
          expectedLocationId
        )
      }
    )
  })
})
