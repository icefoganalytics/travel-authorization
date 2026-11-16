import { flushPromises } from "@vue/test-utils"
import { VAutocomplete } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import { mockHttpClient, mountWithDefaultPlugins } from "@/tests/support"

import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"

describe("web/src/components/travel-authorizations/PurposeEditFormCard.vue", () => {
  describe("PurposeEditFormCard", () => {
    test("when a closed multi-city itinerary is saved without changes, preserves its return home", async () => {
      // Arrange
      const travelSegment1 = travelSegmentFactory.build({
        id: 1,
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
      })
      const travelSegment2 = travelSegmentFactory.build({
        id: 2,
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 3,
        departureOn: "2026-11-12",
      })
      const travelSegment3 = travelSegmentFactory.build({
        id: 3,
        travelAuthorizationId: 5,
        segmentNumber: 3,
        departureLocationId: 3,
        arrivalLocationId: 1,
        departureOn: "2026-11-12",
      })
      const travelSegments = [travelSegment1, travelSegment2, travelSegment3]
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
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
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
        arrivalLocationId: 3,
      })
      const expectedSegment3 = expect.objectContaining({
        segmentNumber: 3,
        departureLocationId: 3,
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
    })

    test("when a closed multi-city itinerary is saved with a new destination, preserves its return home", async () => {
      // Arrange
      const travelSegment1 = travelSegmentFactory.build({
        id: 1,
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
      })
      const travelSegment2 = travelSegmentFactory.build({
        id: 2,
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 3,
        departureOn: "2026-11-12",
      })
      const travelSegment3 = travelSegmentFactory.build({
        id: 3,
        travelAuthorizationId: 5,
        segmentNumber: 3,
        departureLocationId: 3,
        arrivalLocationId: 1,
        departureOn: "2026-11-12",
      })
      const travelSegments = [travelSegment1, travelSegment2, travelSegment3]
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
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      wrapper.getComponent(VAutocomplete).vm.$emit("update:modelValue", 4)
      await flushPromises()
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
        arrivalLocationId: 4,
      })
      const expectedSegment3 = expect.objectContaining({
        segmentNumber: 3,
        departureLocationId: 4,
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
    })

    test("when the required destination is cleared, it does not save the itinerary", async () => {
      // Arrange
      const travelSegment1 = travelSegmentFactory.build({
        id: 1,
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
      })
      const travelSegment2 = travelSegmentFactory.build({
        id: 2,
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 3,
        departureOn: "2026-11-12",
      })
      const travelSegment3 = travelSegmentFactory.build({
        id: 3,
        travelAuthorizationId: 5,
        segmentNumber: 3,
        departureLocationId: 3,
        arrivalLocationId: 1,
        departureOn: "2026-11-12",
      })
      const travelSegments = [travelSegment1, travelSegment2, travelSegment3]
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
      const wrapper = mountWithDefaultPlugins(PurposeEditFormCard, {
        props: { travelAuthorizationId: 5 },
      })
      await flushPromises()

      // Act
      wrapper.getComponent(VAutocomplete).vm.$emit("update:modelValue", null)
      await flushPromises()
      await wrapper.vm.save()
      await flushPromises()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })
  })
})
