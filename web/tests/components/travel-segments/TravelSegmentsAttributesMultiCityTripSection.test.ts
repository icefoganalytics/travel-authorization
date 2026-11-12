import { flushPromises, mount } from "@vue/test-utils"
import { VSelect } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelSegmentsAttributesMultiCityTripSection from "@/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"

import { locationFactory, travelSegmentFactory } from "@/tests/factories"
import { mockHttpClient, mockVuetify } from "@/tests/support"

describe("web/src/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue", () => {
  describe("TravelSegmentsAttributesMultiCityTripSection", () => {
    test.each([
      { action: "left unconfirmed", expectedMarker: [false, false, false] },
      { action: "earlier arrival chosen", expectedMarker: [true, false, false] },
      { action: "suggestion accepted", expectedMarker: [false, true, false] },
    ])(
      "when a closed route is $action, emits the explicit choice",
      async ({ action, expectedMarker }) => {
        // Arrange
        const travelSegments = [
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 3 },
          { departureLocationId: 3, arrivalLocationId: 1 },
        ].map((locations, index) =>
          travelSegmentFactory.build({
            ...locations,
            segmentNumber: index + 1,
          })
        )
        const locations = locationFactory.buildList(3)
        mockHttpClient().get.mockResolvedValue({ data: { locations, totalCount: 3 } })
        const wrapper = mount(TravelSegmentsAttributesMultiCityTripSection, {
          props: {
            travelAuthorizationId: 5,
            currentTripType: TravelAuthorizationTripTypes.MULTI_CITY,
            currentTravelSegments: travelSegments,
          },
          global: {
            plugins: [mockVuetify()],
          },
        })
        await flushPromises()

        // Act
        if (action === "earlier arrival chosen") {
          wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 0)
        } else if (action === "suggestion accepted") {
          await wrapper.get("button").trigger("click")
        }
        await flushPromises()

        // Assert
        const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
        expect(updatedSegments.map((segment) => segment.isPrimaryDestination)).toEqual(
          expectedMarker
        )
      }
    )

    test.each([
      { action: "selected arrival changed", expectedMarker: [false, false, false] },
      { action: "preceding connection changed", expectedMarker: [false, false, false] },
      { action: "selected leg deleted", expectedMarker: [false, false] },
      { action: "unrelated time edited", expectedMarker: [false, true, false] },
      { action: "legs reordered", expectedMarker: [false, false, true] },
      { action: "marked route reloaded", expectedMarker: [false, true, false] },
    ])(
      "when the $action, keeps the choice tied to its arrival",
      async ({ action, expectedMarker }) => {
        // Arrange
        const travelSegments = [
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 3 },
          { departureLocationId: 3, arrivalLocationId: 1 },
        ].map((locations, index) =>
          travelSegmentFactory.build({
            ...locations,
            segmentNumber: index + 1,
            isPrimaryDestination: index === 1,
          })
        )
        mockHttpClient().get.mockResolvedValue({ data: { locations: [], totalCount: 0 } })
        const wrapper = mount(TravelSegmentsAttributesMultiCityTripSection, {
          props: {
            travelAuthorizationId: 5,
            currentTripType: TravelAuthorizationTripTypes.MULTI_CITY,
            currentTravelSegments: travelSegments,
          },
          global: {
            plugins: [mockVuetify()],
          },
        })
        await flushPromises()

        // Act
        if (action === "selected arrival changed") {
          wrapper.findAllComponents(LocationsAutocomplete)[3].vm.$emit("update:modelValue", 4)
        } else if (action === "preceding connection changed") {
          wrapper.findAllComponents(LocationsAutocomplete)[4].vm.$emit("update:modelValue", 4)
        } else if (action === "selected leg deleted") {
          await wrapper.get('button[title="Remove leg"]').trigger("click")
        } else if (action === "unrelated time edited") {
          wrapper.findAllComponents(TimeTextField)[1].vm.$emit("update:modelValue", "12:30")
        } else if (action === "legs reordered") {
          await wrapper.setProps({
            currentTravelSegments: [travelSegments[2], travelSegments[0], travelSegments[1]],
          })
        }
        await flushPromises()

        // Assert
        const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
        expect(updatedSegments.map((segment) => segment.isPrimaryDestination)).toEqual(
          expectedMarker
        )
      }
    )

    test("when an earlier leg is chosen, does not rewrite any endpoint", async () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: 2 },
        { departureLocationId: 2, arrivalLocationId: 3 },
        { departureLocationId: 3, arrivalLocationId: 1 },
      ].map((locations, index) =>
        travelSegmentFactory.build({
          ...locations,
          segmentNumber: index + 1,
        })
      )
      mockHttpClient().get.mockResolvedValue({ data: { locations: [], totalCount: 0 } })
      const wrapper = mount(TravelSegmentsAttributesMultiCityTripSection, {
        props: {
          travelAuthorizationId: 5,
          currentTripType: TravelAuthorizationTripTypes.MULTI_CITY,
          currentTravelSegments: travelSegments,
        },
        global: {
          plugins: [mockVuetify()],
        },
      })
      await flushPromises()

      // Act
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 0)
      await flushPromises()

      // Assert
      const updatedSegments = wrapper.emitted("updated")?.at(-1)?.[0] as TravelSegment[]
      expect(updatedSegments).toEqual([
        expect.objectContaining({ departureLocationId: 1, arrivalLocationId: 2 }),
        expect.objectContaining({ departureLocationId: 2, arrivalLocationId: 3 }),
        expect.objectContaining({ departureLocationId: 3, arrivalLocationId: 1 }),
      ])
    })
  })
})
