import { flushPromises } from "@vue/test-utils"
import { VTextField } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import { travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import { mockHttpClient, mockHttpGetRoutes, mountWithDefaultPlugins } from "@/tests/support"

import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"

describe("web/src/components/travel-authorizations/PurposeEditFormCard.vue", () => {
  describe("PurposeEditFormCard", () => {
    test("when purpose changes on a multi-city request, saves no itinerary attributes", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3)
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        allTravelWithinTerritory: false,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({
          travelPurposes: [{ id: 1, purpose: "Meeting" }],
          totalCount: 1,
        }),
      })
      httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      const eventNameField = wrapper.findAllComponents(VTextField).find((field) => {
        return field.props("label") === "Name of meeting/conference, mission, trade fair or course *"
      })
      if (!eventNameField) throw new Error("Meeting name field is missing")

      await eventNameField.get("input").setValue("Updated meeting")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        purposeId: 1,
        eventName: "Updated meeting",
        allTravelWithinTerritory: false,
        benefits: "Coordinate the regional program",
      })
    })

    test("when a new request has no legs, saves purpose without creating an itinerary", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        travelSegments: [],
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({
          travelPurposes: [{ id: 1, purpose: "Meeting" }],
          totalCount: 1,
        }),
      })
      httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
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

    test("when the meeting name is cleared, does not save invalid purpose details", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({
          travelPurposes: [{ id: 1, purpose: "Meeting" }],
          totalCount: 1,
        }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      const eventNameField = wrapper.findAllComponents(VTextField).find((field) => {
        return field.props("label") === "Name of meeting/conference, mission, trade fair or course *"
      })
      if (!eventNameField) throw new Error("Meeting name field is missing")

      await eventNameField.get("input").setValue("")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })
  })
})
