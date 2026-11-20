import { flushPromises } from "@vue/test-utils"
import { VTextField } from "vuetify/components"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/tests/factories"
import { mockHttpClient, mockHttpGetRoutes, mountWithDefaultPlugins } from "@/tests/support"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"

describe("web/src/components/travel-authorizations/PurposeEditFormCard.vue", () => {
  describe("PurposeEditFormCard", () => {
    test("when the meeting name changes, saves it without changing the itinerary", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3)
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        finalDestinationLocationId: 2,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        allTravelWithinTerritory: false,
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations": () => ({
          locations: [locationFactory.build({ id: 2 })],
          totalCount: 1,
        }),
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
        return (
          field.props("label") === "Name of meeting/conference, mission, trade fair or course *"
        )
      })
      if (!eventNameField) throw new Error("Meeting name field is missing")

      await eventNameField.get("input").setValue("Updated meeting")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 2,
        purposeId: 1,
        eventName: "Updated meeting",
        allTravelWithinTerritory: false,
        benefits: "Coordinate the regional program",
      })
    })

    test("when a traveller first selects a destination, saves the city without rewriting the initial legs", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        finalDestinationLocationId: null,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        travelSegments: [
          travelSegmentFactory.build({ travelAuthorizationId: 5, segmentNumber: 1 }),
          travelSegmentFactory.build({ travelAuthorizationId: 5, segmentNumber: 2 }),
        ],
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations": () => ({
          locations: [locationFactory.build({ id: 2 })],
          totalCount: 1,
        }),
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
      wrapper.getComponent(LocationsAutocomplete).vm.$emit("update:modelValue", 2)
      await flushPromises()
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        finalDestinationLocationId: 2,
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
        finalDestinationLocationId: 2,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations": () => ({
          locations: [locationFactory.build({ id: 2 })],
          totalCount: 1,
        }),
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
        return (
          field.props("label") === "Name of meeting/conference, mission, trade fair or course *"
        )
      })
      if (!eventNameField) throw new Error("Meeting name field is missing")

      await eventNameField.get("input").setValue("")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when the traveller changes Final Destination, saves the new city without rewriting existing legs", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, {
        travelAuthorizationId: 5,
        arrivalLocationId: 2,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        allTravelWithinTerritory: false,
        finalDestinationLocationId: 2,
        travelSegments,
      })
      const ottawa = locationFactory.build({ id: 4, city: "Ottawa", province: "ON" })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({
          travelPurposes: [{ id: 1, purpose: "Meeting" }],
          totalCount: 1,
        }),
        "/api/locations": () => ({ locations: [ottawa], totalCount: 1 }),
      })
      httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      wrapper.getComponent(LocationsAutocomplete).vm.$emit("update:modelValue", 4)
      await flushPromises()
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        purposeId: 1,
        eventName: "Planning meeting",
        allTravelWithinTerritory: false,
        benefits: "Coordinate the regional program",
        finalDestinationLocationId: 4,
      })
    })

    test("when a saved destination differs from the itinerary, displays the saved choice", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(2, { arrivalLocationId: 2 })
      const ottawa = locationFactory.build({ id: 4, city: "Ottawa", province: "ON" })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        finalDestinationLocationId: 4,
        travelSegments,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({ travelPurposes: [], totalCount: 0 }),
        "/api/locations": () => ({ locations: [ottawa], totalCount: 1 }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })

      // Act
      await flushPromises()

      // Assert
      const destination = wrapper.getComponent(LocationsAutocomplete)
      expect(destination.props("modelValue")).toBe(4)
    })

    test.each([null, 2])(
      "when the required destination is blank after starting with %s, does not save",
      async (locationId) => {
        // Arrange
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          purposeId: 1,
          eventName: "Planning meeting",
          benefits: "Coordinate the regional program",
          finalDestinationLocationId: locationId,
        })
        const httpClient = mockHttpClient()
        mockHttpGetRoutes({
          "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
          "/api/travel-purposes": () => ({
            travelPurposes: [{ id: 1, purpose: "Meeting" }],
            totalCount: 1,
          }),
          "/api/locations": () => ({ locations: [], totalCount: 0 }),
        })
        const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
          props: { travelAuthorizationId: 5 },
        })
        await flushPromises()

        // Act
        wrapper.getComponent(LocationsAutocomplete).vm.$emit("update:modelValue", null)
        await flushPromises()
        await wrapper.vm.save()

        // Assert
        expect(httpClient.patch).not.toHaveBeenCalled()
      }
    )
  })
})
