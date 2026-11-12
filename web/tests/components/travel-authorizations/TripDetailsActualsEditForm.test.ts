import { flushPromises, mount } from "@vue/test-utils"
import { VSelect } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

import TripDetailsActualsEditForm from "@/components/travel-authorizations/TripDetailsActualsEditForm.vue"

import { travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

describe("web/src/components/travel-authorizations/TripDetailsActualsEditForm.vue", () => {
  describe("TripDetailsActualsEditForm", () => {
    test.each([
      { phase: "saved actuals", hasActuals: true, expectedSelection: 1 },
      { phase: "estimated route only", hasActuals: false, expectedSelection: null },
    ])(
      "when loading $phase, does not copy estimated confirmation",
      async ({ hasActuals, expectedSelection }) => {
        // Arrange
        const estimateSegments = [
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 3 },
          { departureLocationId: 3, arrivalLocationId: 1 },
        ].map((locations, index) =>
          travelSegmentFactory.build({
            ...locations,
            segmentNumber: index + 1,
            departureTime: "09:00",
            isPrimaryDestination: index === 0,
          })
        )
        let travelSegments = estimateSegments
        if (hasActuals) {
          const actualSegments = estimateSegments.map((segment, index) =>
            travelSegmentFactory.build({
              ...segment,
              id: index + 10,
              isActual: true,
              isPrimaryDestination: index === 1,
            })
          )
          travelSegments = [...estimateSegments, ...actualSegments]
        }
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
          travelSegments,
        })
        mockHttpClient().get.mockResolvedValue({
          data: {
            travelAuthorization,
            travelSegments,
            locations: [],
            totalCount: travelSegments.length,
          },
        })
        const router = mockRouter()
        await router.push("/")
        const wrapper = mount(TripDetailsActualsEditForm, {
          props: { travelAuthorizationId: 5 },
          global: {
            plugins: [router, mockVuetify()],
          },
        })

        // Act
        await flushPromises()
        await vi.dynamicImportSettled()
        await flushPromises()

        // Assert
        expect(wrapper.getComponent(VSelect).props("modelValue")).toBe(expectedSelection)
      }
    )

    test("when an actual arrival is chosen and saved, reload retains it independently of estimates", async () => {
      // Arrange
      const estimateSegments = [
        { departureLocationId: 1, arrivalLocationId: 2 },
        { departureLocationId: 2, arrivalLocationId: 3 },
        { departureLocationId: 3, arrivalLocationId: 1 },
      ].map((locations, index) =>
        travelSegmentFactory.build({
          ...locations,
          segmentNumber: index + 1,
          departureTime: "09:00",
          isPrimaryDestination: index === 1,
        })
      )
      let travelSegments = [...estimateSegments]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      httpClient.get.mockImplementation(async () => ({
        data: {
          travelAuthorization,
          travelSegments,
          locations: [],
          totalCount: travelSegments.length,
        },
      }))
      httpClient.patch.mockImplementation(async (_url, attributes) => {
        const { travelSegmentActualsAttributes } = attributes as {
          travelSegmentActualsAttributes: Partial<TravelSegment>[]
        }
        const actualSegments = travelSegmentActualsAttributes.map((segment, index) => {
          return travelSegmentFactory.build({ ...segment, id: index + 10 })
        })
        travelSegments = [...estimateSegments, ...actualSegments]
        travelAuthorization.tripTypeActual = TravelAuthorizationTripTypes.MULTI_CITY
        return { data: { travelAuthorization, policy: {} } }
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mount(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: {
          plugins: [router, mockVuetify()],
        },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 0)
      await flushPromises()
      await wrapper.vm.save()
      wrapper.unmount()
      const reloadedWrapper = mount(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: {
          plugins: [router, mockVuetify()],
        },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Assert
      expect(reloadedWrapper.getComponent(VSelect).props("modelValue")).toBe(0)
    })
  })
})
