import { flushPromises } from "@vue/test-utils"
import { VSelect } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

import { travelSegmentFactory } from "@/tests/factories"
import { mockHttpGetRoute, mountWithDefaultPlugins } from "@/tests/support"

import TimeTextField from "@/components/common/TimeTextField.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelSegmentsAttributesMultiCityTripSection from "@/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue"

describe("web/src/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue", () => {
  describe("TravelSegmentsAttributesMultiCityTripSection", () => {
    test("when an old multi-city route is opened, leaves its primary destination unconfirmed", async () => {
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
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const primaryDestinationFlags = updatedSegments.map((segment) => segment.isPrimaryDestination)
      expect(primaryDestinationFlags).toEqual([false, false, false])
    })

    test("when the traveller accepts the suggestion, confirms the suggested arrival", async () => {
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
        props: {
          travelAuthorizationId: 5,
          currentTripType: TravelAuthorizationTripTypes.MULTI_CITY,
          currentTravelSegments: travelSegments,
        },
      })
      await flushPromises()

      // Act
      const suggestionButton = wrapper.findAll("button").find((button) => {
        return button.text().includes("Use suggested arrival")
      })
      if (!suggestionButton) throw new Error("Suggested arrival button is missing")

      await suggestionButton.trigger("click")
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const primaryDestinationFlags = updatedSegments.map((segment) => segment.isPrimaryDestination)
      expect(primaryDestinationFlags).toEqual([true, false])
    })

    test("when an earlier leg is chosen, marks only that leg without rewriting endpoints", async () => {
      // Arrange
      const travelSegment1 = travelSegmentFactory.build({
        departureLocationId: 1,
        arrivalLocationId: 2,
      })
      const travelSegment2 = travelSegmentFactory.build({
        departureLocationId: 2,
        arrivalLocationId: 3,
      })
      const travelSegment3 = travelSegmentFactory.build({
        departureLocationId: 3,
        arrivalLocationId: 1,
      })
      const travelSegments = [travelSegment1, travelSegment2, travelSegment3]
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
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 0)
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const expectedSegment1 = expect.objectContaining({
        departureLocationId: 1,
        arrivalLocationId: 2,
        isPrimaryDestination: true,
      })
      const expectedSegment2 = expect.objectContaining({
        departureLocationId: 2,
        arrivalLocationId: 3,
        isPrimaryDestination: false,
      })
      const expectedSegment3 = expect.objectContaining({
        departureLocationId: 3,
        arrivalLocationId: 1,
        isPrimaryDestination: false,
      })
      expect(updatedSegments).toEqual([expectedSegment1, expectedSegment2, expectedSegment3])
    })

    test("when the selected arrival changes, clears confirmation without selecting a replacement", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      travelSegments[1].isPrimaryDestination = true
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
      const selectedArrival = wrapper.findAllComponents(LocationsAutocomplete)[3]
      selectedArrival.vm.$emit("update:modelValue", 4)
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const primaryDestinationFlags = updatedSegments.map((segment) => segment.isPrimaryDestination)
      expect(primaryDestinationFlags).toEqual([false, false, false])
    })

    test("when a connection edit changes the selected arrival, clears its confirmation", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      travelSegments[1].isPrimaryDestination = true
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
      const nextDeparture = wrapper.findAllComponents(LocationsAutocomplete)[4]
      nextDeparture.vm.$emit("update:modelValue", 4)
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const primaryDestinationFlags = updatedSegments.map((segment) => segment.isPrimaryDestination)
      expect(primaryDestinationFlags).toEqual([false, false, false])
    })

    test("when the selected leg is removed, does not select another arrival", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      travelSegments[1].isPrimaryDestination = true
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
      await wrapper.get('button[title="Remove leg"]').trigger("click")
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const primaryDestinationFlags = updatedSegments.map((segment) => segment.isPrimaryDestination)
      expect(primaryDestinationFlags).toEqual([false, false])
    })

    test("when an unrelated departure time changes, preserves the selected arrival", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      travelSegments[1].isPrimaryDestination = true
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
      const selectedLegTime = wrapper.findAllComponents(TimeTextField)[1]
      selectedLegTime.vm.$emit("update:modelValue", "12:30")
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const primaryDestinationFlags = updatedSegments.map((segment) => segment.isPrimaryDestination)
      expect(primaryDestinationFlags).toEqual([false, true, false])
    })

    test("when saved legs are reordered, keeps the marker on the same arrival leg", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      travelSegments[1].isPrimaryDestination = true
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
      await wrapper.setProps({
        currentTravelSegments: [travelSegments[2], travelSegments[0], travelSegments[1]],
      })
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const expectedSegment1 = expect.objectContaining({
        id: travelSegments[2].id,
        isPrimaryDestination: false,
      })
      const expectedSegment2 = expect.objectContaining({
        id: travelSegments[0].id,
        isPrimaryDestination: false,
      })
      const expectedSegment3 = expect.objectContaining({
        id: travelSegments[1].id,
        isPrimaryDestination: true,
      })
      expect(updatedSegments).toEqual([expectedSegment1, expectedSegment2, expectedSegment3])
    })

    test("when a saved marked route is loaded, displays its existing choice", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      travelSegments[1].isPrimaryDestination = true
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
      expect(primaryDestination.props("modelValue")).toBe(1)
    })

    test("when the primary destination is cleared, leaves the draft unconfirmed", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 2 })
      travelSegments[1].isPrimaryDestination = true
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
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", null)
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      const primaryDestinationFlags = updatedSegments.map((segment) => segment.isPrimaryDestination)
      expect(primaryDestinationFlags).toEqual([false, false, false])
    })
  })
})
