import { flushPromises } from "@vue/test-utils"
import { VTextField } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { TravelSegmentAccommodationTypes } from "@/api/travel-segments-api"

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
      const travelSegments = travelSegmentFactory.buildList(3, { travelAuthorizationId: 5 })
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
        "/api/locations": () => {
          const location = locationFactory.build({ id: 2 })
          return { locations: [location], totalCount: 1 }
        },
        "/api/travel-purposes": () => ({
          travelPurposes: [
            {
              id: 1,
              purpose: "Meeting",
            },
          ],
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
      if (!eventNameField) {
        throw new Error("Meeting name field is missing")
      }

      await eventNameField.get("input").setValue("Updated meeting")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch.mock.calls).toEqual([
        [
          "/api/travel-authorizations/5",
          {
            ...travelAuthorization,
            eventName: "Updated meeting",
          },
        ],
      ])
    })

    test("when a traveller first selects a destination, saves the city without rewriting the initial legs", async () => {
      // Arrange
      const outbound = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const inbound = travelSegmentFactory.build({ travelAuthorizationId: 5, segmentNumber: 2 })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.ROUND_TRIP,
        finalDestinationLocationId: null,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        travelSegments: [outbound, inbound],
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations": () => {
          const location = locationFactory.build({ id: 2 })
          return { locations: [location], totalCount: 1 }
        },
        "/api/travel-purposes": () => ({
          travelPurposes: [
            {
              id: 1,
              purpose: "Meeting",
            },
          ],
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
      expect(httpClient.patch.mock.calls).toEqual([
        [
          "/api/travel-authorizations/5",
          {
            ...travelAuthorization,
            finalDestinationLocationId: 2,
          },
        ],
      ])
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
        "/api/locations": () => {
          const location = locationFactory.build({ id: 2 })
          return { locations: [location], totalCount: 1 }
        },
        "/api/travel-purposes": () => ({
          travelPurposes: [
            {
              id: 1,
              purpose: "Meeting",
            },
          ],
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
      if (!eventNameField) {
        throw new Error("Meeting name field is missing")
      }

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
          travelPurposes: [
            {
              id: 1,
              purpose: "Meeting",
            },
          ],
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
      expect(httpClient.patch.mock.calls).toEqual([
        [
          "/api/travel-authorizations/5",
          {
            ...travelAuthorization,
            finalDestinationLocationId: 4,
          },
        ],
      ])
    })

    test("when a saved destination differs from the itinerary, displays the saved choice", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(2, {
        travelAuthorizationId: 5,
        arrivalLocationId: 2,
      })
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

    test("when the destination is still blank, does not save", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        finalDestinationLocationId: null,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({
          travelPurposes: [
            {
              id: 1,
              purpose: "Meeting",
            },
          ],
          totalCount: 1,
        }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when the traveller clears a saved destination, does not save", async () => {
      // Arrange
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        purposeId: 1,
        eventName: "Planning meeting",
        benefits: "Coordinate the regional program",
        finalDestinationLocationId: 2,
      })
      const savedCity = locationFactory.build({ id: 2, city: "Toronto", province: "ON" })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({
          travelPurposes: [
            {
              id: 1,
              purpose: "Meeting",
            },
          ],
          totalCount: 1,
        }),
        "/api/locations": () => ({ locations: [savedCity], totalCount: 1 }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      const autocomplete = wrapper.getComponent(LocationsAutocomplete)
      const input = autocomplete.get("input")
      await input.trigger("focus")
      await input.setValue("")
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    test("when the traveller clears a saved destination, notifies the wizard with null", async () => {
      // Arrange
      const savedCity = locationFactory.build({ id: 2, city: "Toronto", province: "ON" })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        finalDestinationLocationId: savedCity.id,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-purposes": () => ({ travelPurposes: [], totalCount: 0 }),
        "/api/locations": () => ({ locations: [savedCity], totalCount: 1 }),
      })
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      const input = wrapper.getComponent(LocationsAutocomplete).get("input")
      await input.trigger("focus")
      await input.setValue("")

      // Assert
      expect(wrapper.emitted("update:finalDestinationLocationId")?.at(-1)).toEqual([null])
    })
  })
})
