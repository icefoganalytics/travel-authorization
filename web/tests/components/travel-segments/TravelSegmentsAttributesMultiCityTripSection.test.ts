import { flushPromises } from "@vue/test-utils"
import { omit } from "lodash"
import { VSelect } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { TravelSegmentAccommodationTypes } from "@/api/travel-segments-api"

import { travelSegmentFactory } from "@/tests/factories"
import { mockHttpGetRoute, mountWithDefaultPlugins } from "@/tests/support"

import TimeTextField from "@/components/common/TimeTextField.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelSegmentsAttributesMultiCityTripSection from "@/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue"

describe("web/src/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue", () => {
  describe("TravelSegmentsAttributesMultiCityTripSection", () => {
    test("when a draft is opened, leaves the destination unconfirmed", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTripType: TravelAuthorizationTripTypes.MULTI_CITY,
          currentTravelSegments: travelSegments,
        },
      })

      // Act
      await flushPromises()

      // Assert
      const primaryDestination = wrapper.getComponent(VSelect)
      expect(primaryDestination.props("modelValue")).toBeNull()
    })

    test("when no primary destination is chosen, validation shows the required-field error", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTripType: TravelAuthorizationTripTypes.MULTI_CITY,
          currentTravelSegments: travelSegments,
        },
      })
      await flushPromises()

      // Act
      const primaryDestination = wrapper.getComponent(VSelect)
      await primaryDestination.vm.validate()
      await flushPromises()

      // Assert
      expect(primaryDestination.get(".v-messages").text()).toEqual("This field is required")
    })

    test("when arrivals repeat, offers each city once", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTravelSegments: travelSegments,
        },
      })

      // Act
      await flushPromises()

      // Assert
      const primaryDestination = wrapper.getComponent(VSelect)
      expect(primaryDestination.props("items")).toEqual([{ title: "Arrival city", value: 2 }])
    })

    test("when the traveller accepts a suggestion, emits its location identity", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        departureLocationId: 1,
        arrivalLocationId: 2,
      })
      const returnSegment = travelSegmentFactory.build({
        departureLocationId: 2,
        arrivalLocationId: 1,
      })
      const travelSegments = [outboundSegment, returnSegment]
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: { travelAuthorizationId: 5, currentTravelSegments: travelSegments },
      })
      await flushPromises()

      // Act
      const suggestionButton = wrapper.findAll("button").find((button) => {
        return button.text().includes("Use suggested destination")
      })
      if (!suggestionButton) throw new Error("Suggested destination button is missing")

      await suggestionButton.trigger("click")
      await flushPromises()

      // Assert
      const destinationUpdate = wrapper.emitted("update:primaryDestinationLocationId")
      expect(destinationUpdate).toEqual([[2]])
    })

    test("when a city is selected, leaves every itinerary attribute unchanged", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
      })
      const returnSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
      })
      const travelSegments = [outboundSegment, returnSegment]
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: { travelAuthorizationId: 5, currentTravelSegments: travelSegments },
      })
      await flushPromises()

      // Act
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 2)
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0]
      const expectedOutbound = omit(outboundSegment, ["createdAt", "updatedAt"])
      expectedOutbound.accommodationType = TravelSegmentAccommodationTypes.HOTEL
      const expectedReturn = omit(returnSegment, ["createdAt", "updatedAt"])
      expect(updatedSegments).toEqual([expectedOutbound, expectedReturn])
    })

    test.each([
      {
        condition: "the last matching arrival changes",
        repeatedArrival: 3,
        expectedUpdates: [[null]],
      },
      {
        condition: "another arrival still matches",
        repeatedArrival: 2,
        expectedUpdates: undefined,
      },
    ])("when $condition, invalidates only an absent city", async (scenario) => {
      const { repeatedArrival, expectedUpdates } = scenario

      // Arrange
      const firstSegment = travelSegmentFactory.build({ arrivalLocationId: 2 })
      const secondSegment = travelSegmentFactory.build({ arrivalLocationId: repeatedArrival })
      const travelSegments = [firstSegment, secondSegment]
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTravelSegments: travelSegments,
          primaryDestinationLocationId: 2,
        },
      })
      await flushPromises()

      // Act
      const firstArrival = wrapper.findAllComponents(LocationsAutocomplete)[1]
      firstArrival.vm.$emit("update:modelValue", 4)
      await flushPromises()

      // Assert
      const destinationUpdates = wrapper.emitted("update:primaryDestinationLocationId")
      expect(destinationUpdates).toEqual(expectedUpdates)
    })

    test.each([
      {
        condition: "the last matching arrival is removed",
        remainingArrival: 3,
        expectedUpdates: [[null]],
      },
      {
        condition: "a repeated arrival remains after removal",
        remainingArrival: 2,
        expectedUpdates: undefined,
      },
    ])("when $condition, preserves only cities still present", async (scenario) => {
      const { remainingArrival, expectedUpdates } = scenario

      // Arrange
      const firstSegment = travelSegmentFactory.build({ arrivalLocationId: remainingArrival })
      const selectedSegment = travelSegmentFactory.build({ arrivalLocationId: 2 })
      const finalSegment = travelSegmentFactory.build({ arrivalLocationId: 1 })
      const travelSegments = [firstSegment, selectedSegment, finalSegment]
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTravelSegments: travelSegments,
          primaryDestinationLocationId: 2,
        },
      })
      await flushPromises()

      // Act
      await wrapper.get('button[title="Remove leg"]').trigger("click")
      await flushPromises()

      // Assert
      const destinationUpdates = wrapper.emitted("update:primaryDestinationLocationId")
      expect(destinationUpdates).toEqual(expectedUpdates)
    })

    test("when a saved city is cleared, emits an unconfirmed destination", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(2, { arrivalLocationId: 2 })
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTravelSegments: travelSegments,
          primaryDestinationLocationId: 2,
        },
      })
      await flushPromises()

      // Act
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", null)
      await flushPromises()

      // Assert
      const destinationUpdates = wrapper.emitted("update:primaryDestinationLocationId")
      expect(destinationUpdates).toEqual([[null]])
    })

    test.each([
      {
        condition: "a connection edit removes the city",
        action: "connection",
        expectedUpdates: [[null]],
      },
      { condition: "the route is reordered", action: "reorder", expectedUpdates: undefined },
      { condition: "a departure time changes", action: "time", expectedUpdates: undefined },
    ])("when $condition, preserves only a matching city", async (scenario) => {
      const { action, expectedUpdates } = scenario

      // Arrange
      const firstSegment = travelSegmentFactory.build({ arrivalLocationId: 2 })
      const secondSegment = travelSegmentFactory.build({ arrivalLocationId: 3 })
      const finalSegment = travelSegmentFactory.build({ arrivalLocationId: 1 })
      const travelSegments = [firstSegment, secondSegment, finalSegment]
      mockHttpGetRoute("/api/locations", () => ({ locations: [], totalCount: 0 }))
      const wrapper = mountWithDefaultPlugins(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTravelSegments: travelSegments,
          primaryDestinationLocationId: 2,
        },
      })
      await flushPromises()

      // Act
      if (action === "connection") {
        const nextDeparture = wrapper.findAllComponents(LocationsAutocomplete)[2]
        nextDeparture.vm.$emit("update:modelValue", 4)
      } else if (action === "time") {
        wrapper.getComponent(TimeTextField).vm.$emit("update:modelValue", "12:30")
      } else {
        await wrapper.setProps({
          currentTravelSegments: [finalSegment, firstSegment, secondSegment],
        })
      }
      await flushPromises()

      // Assert
      const destinationUpdates = wrapper.emitted("update:primaryDestinationLocationId")
      expect(destinationUpdates).toEqual(expectedUpdates)
    })
  })
})
