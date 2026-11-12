import { flushPromises, mount } from "@vue/test-utils"
import { VTextField } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"

import { travelAuthorizationFactory } from "@/tests/factories"
import travelSegmentFactory from "@/tests/factories/travel-segment-factory"
import { mockHttpClient, mockVuetify } from "@/tests/support"

describe("web/src/components/travel-authorizations/PurposeEditFormCard.vue", () => {
  describe("PurposeEditFormCard", () => {
    test.each([TravelAuthorizationTripTypes.ROUND_TRIP, TravelAuthorizationTripTypes.MULTI_CITY])(
      "when purpose is saved for %s, only purpose attributes are posted",
      async (tripType) => {
        // Arrange
        const travelSegments = travelSegmentFactory.buildList(3, {
          departureLocationId: 1,
          arrivalLocationId: 2,
          isPrimaryDestination: false,
        })
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          purposeId: 1,
          eventName: "Planning meeting",
          benefits: "Coordinate the regional program",
          allTravelWithinTerritory: false,
          tripTypeEstimate: tripType,
          travelSegments,
        })
        const httpClient = mockHttpClient()
        httpClient.get.mockResolvedValue({
          data: {
            travelAuthorization,
            travelPurposes: [{ id: 1, purpose: "Meeting" }],
            totalCount: 1,
            policy: {},
          },
        })
        httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
        const wrapper = mount(PurposeEditFormCard, {
          props: { travelAuthorizationId: 5 },
          global: {
            plugins: [mockVuetify()],
          },
        })
        await flushPromises()

        // Act
        const eventNameField = wrapper.findAllComponents(VTextField).find((field) => {
          return (
            field.props("label") === "Name of meeting/conference, mission, trade fair or course *"
          )
        })
        if (!eventNameField) throw new Error("Meeting name field is missing")
        await eventNameField.get("input").setValue("Updated meeting")
        await flushPromises()
        await wrapper.vm.save()

        // Assert
        expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
          purposeId: 1,
          eventName: "Updated meeting",
          allTravelWithinTerritory: false,
          benefits: "Coordinate the regional program",
        })
      }
    )

    test("when a new request has no legs, purpose can still be saved", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
      })
      const httpClient = mockHttpClient()
      httpClient.get.mockResolvedValue({
        data: {
          travelAuthorization,
          travelPurposes: [{ id: 1, purpose: "Meeting" }],
          totalCount: 1,
          policy: {},
        },
      })
      httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      const wrapper = mount(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
        global: {
          plugins: [mockVuetify()],
        },
      })
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        purposeId: 1,
        eventName: "Planning meeting",
        allTravelWithinTerritory: null,
        benefits: "Coordinate the regional program",
      })
    })
  })
})
