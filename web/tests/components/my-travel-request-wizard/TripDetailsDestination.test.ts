import { flushPromises, mount } from "@vue/test-utils"
import { defineComponent, h, ref } from "vue"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import useCurrentUser from "@/use/use-current-user"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import ConfirmActualTravelDetailsStep from "@/components/my-travel-request-wizard/ConfirmActualTravelDetailsStep.vue"
import EditTripDetailsStep from "@/components/my-travel-request-wizard/EditTripDetailsStep.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

describe("web/src/components/my-travel-request-wizard", () => {
  describe("trip details destination updates", () => {
    test.each([
      { phase: "estimated", step: EditTripDetailsStep },
      { phase: "actual", step: ConfirmActualTravelDetailsStep },
    ])(
      "when an unsaved $phase multi-city destination changes, updates the summary header",
      async ({ step }) => {
        // Arrange
        const travelSegment1 = travelSegmentFactory.build({
          travelAuthorizationId: 5,
          segmentNumber: 1,
          departureLocationId: 1,
          arrivalLocationId: 2,
          departureOn: "2026-11-12",
          isActual: false,
        })
        const travelSegment2 = travelSegmentFactory.build({
          travelAuthorizationId: 5,
          segmentNumber: 2,
          departureLocationId: 2,
          arrivalLocationId: 3,
          departureOn: "2026-11-12",
          isActual: false,
        })
        const travelSegment3 = travelSegmentFactory.build({
          travelAuthorizationId: 5,
          segmentNumber: 3,
          departureLocationId: 3,
          arrivalLocationId: 1,
          departureOn: "2026-11-12",
          isActual: false,
        })
        const travelSegments = [travelSegment1, travelSegment2, travelSegment3]
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          userId: 1,
          purposeId: 1,
          tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
          tripTypeActual: null,
          travelSegments,
        })
        const whitehorse = locationFactory.build({ id: 1, city: "Whitehorse", province: "YT" })
        const vancouver = locationFactory.build({ id: 2, city: "Vancouver", province: "BC" })
        const toronto = locationFactory.build({ id: 3, city: "Toronto", province: "ON" })
        const ottawa = locationFactory.build({ id: 4, city: "Ottawa", province: "ON" })
        const locations = [whitehorse, vancouver, toronto, ottawa]
        mockHttpClient().get.mockImplementation(async (url) => {
          const location = locations.find((location) => url === `/api/locations/${location.id}`)
          return {
            data: {
              travelAuthorization,
              travelSegments,
              locations,
              location,
              user: { id: 1, displayName: "Test Traveler", roles: [] },
              travelPurpose: { id: 1, purpose: "Meeting" },
              expenses: [],
              totalCount: 0,
              policy: {},
            },
          }
        })
        await useCurrentUser().fetch()
        const router = mockRouter([
          {
            path: "/",
            component: {
              template: "<div />",
            },
          },
        ])
        await router.push("/")
        await router.isReady()
        const host = defineComponent({
          setup() {
            const summaryHeaderPanel = ref<InstanceType<typeof SummaryHeaderPanel> | null>(null)
            return () => {
              const summary = h(SummaryHeaderPanel, {
                ref: summaryHeaderPanel,
                travelAuthorizationId: 5,
              })
              const details = h(step, {
                travelAuthorizationId: 5,
                stepTitle: "Trip details",
                stepSubtitle: "Review your itinerary",
                "onUpdate:finalDestinationLocationId": (
                  finalDestinationLocationId: number | null
                ) => {
                  summaryHeaderPanel.value?.update({ finalDestinationLocationId })
                },
              })
              return [summary, details]
            }
          },
        })
        const vuetify = mockVuetify()
        const wrapper = mount(host, {
          global: {
            plugins: [vuetify, router],
          },
        })
        await flushPromises()
        await vi.dynamicImportSettled()
        await flushPromises()

        // Act
        const destinationInput = wrapper.findAllComponents(LocationsAutocomplete)[3]
        destinationInput.vm.$emit("update:modelValue", 4)
        await flushPromises()

        // Assert
        const summaryHeader = wrapper.getComponent(SummaryHeaderPanel)
        expect(summaryHeader.text()).toContain("Ottawa (ON)")
      }
    )
  })
})
