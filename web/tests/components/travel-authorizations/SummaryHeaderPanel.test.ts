import { flushPromises } from "@vue/test-utils"
import { VSelect } from "vuetify/components"

import {
  TravelAuthorizationTripTypes,
  TravelAuthorizationWizardStepNames,
} from "@/api/travel-authorizations-api"

import useCurrentUser from "@/use/use-current-user"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/tests/factories"
import { mockHttpGetRoutes, mockRouter, mountWithDefaultPlugins } from "@/tests/support"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"
import MyTravelRequestWizardPage from "@/pages/my-travel-requests/MyTravelRequestWizardPage.vue"

describe("web/src/components/travel-authorizations/SummaryHeaderPanel.vue", () => {
  describe("SummaryHeaderPanel", () => {
    beforeEach(() => {
      vi.spyOn(window, "scrollTo").mockReturnValue(undefined)
    })

    test("when an unsaved estimated multi-city destination changes, updates the summary header", async () => {
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
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 3 }),
        "/api/locations": () => ({ locations, totalCount: 4 }),
        "/api/locations/1": () => ({ location: whitehorse }),
        "/api/locations/2": () => ({ location: vancouver }),
        "/api/locations/3": () => ({ location: toronto }),
        "/api/locations/4": () => ({ location: ottawa }),
        "/api/current-user": () => ({
          user: { id: 1, displayName: "Test Traveler", roles: [] },
          policy: {},
        }),
        "/api/travel-purposes/1": () => ({
          travelPurpose: { id: 1, purpose: "Meeting" },
        }),
        "/api/expenses": () => ({ expenses: [], totalCount: 0 }),
        "/api/travel-authorizations/5/wizard": () => ({
          travelAuthorization: {
            id: 5,
            status: travelAuthorization.status,
            wizardStepName: TravelAuthorizationWizardStepNames.EDIT_TRIP_DETAILS,
          },
        }),
        "/api/travel-authorization-action-logs": () => ({
          travelAuthorizationActionLogs: [],
          totalCount: 0,
        }),
        "/api/users/1": () => ({
          user: {
            id: 1,
            firstName: "Test",
            lastName: "Traveler",
          },
        }),
      })
      await useCurrentUser().fetch()
      const router = mockRouter([
        {
          path: "/requests/:travelAuthorizationId/:stepName",
          name: "my-travel-requests/MyTravelRequestWizardPage",
          component: MyTravelRequestWizardPage,
        },
        {
          path: "/profile",
          name: "ProfilePage",
          component: MyTravelRequestWizardPage,
        },
      ])
      await router.push("/requests/5/edit-trip-details")
      await router.isReady()
      const wrapper = mountWithDefaultPlugins(MyTravelRequestWizardPage, {
        props: {
          travelAuthorizationId: "5",
          stepName: TravelAuthorizationWizardStepNames.EDIT_TRIP_DETAILS,
        },
        global: {
          plugins: [router],
        },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      const destinationInput = wrapper.findAllComponents(LocationsAutocomplete)[3]
      destinationInput.vm.$emit("update:modelValue", 4)
      await flushPromises()
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 4)
      await flushPromises()

      // Assert
      const summaryHeader = wrapper.getComponent(SummaryHeaderPanel)
      expect(summaryHeader.text()).toContain("Ottawa (ON)")
    })

    test("when an unsaved actual multi-city destination changes, updates the summary header", async () => {
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
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 3 }),
        "/api/locations": () => ({ locations, totalCount: 4 }),
        "/api/locations/1": () => ({ location: whitehorse }),
        "/api/locations/2": () => ({ location: vancouver }),
        "/api/locations/3": () => ({ location: toronto }),
        "/api/locations/4": () => ({ location: ottawa }),
        "/api/current-user": () => ({
          user: { id: 1, displayName: "Test Traveler", roles: [] },
          policy: {},
        }),
        "/api/travel-purposes/1": () => ({
          travelPurpose: { id: 1, purpose: "Meeting" },
        }),
        "/api/expenses": () => ({ expenses: [], totalCount: 0 }),
        "/api/travel-authorizations/5/wizard": () => ({
          travelAuthorization: {
            id: 5,
            status: travelAuthorization.status,
            wizardStepName: TravelAuthorizationWizardStepNames.CONFIRM_ACTUAL_TRAVEL_DETAILS,
          },
        }),
        "/api/travel-authorization-action-logs": () => ({
          travelAuthorizationActionLogs: [],
          totalCount: 0,
        }),
        "/api/users/1": () => ({
          user: {
            id: 1,
            firstName: "Test",
            lastName: "Traveler",
          },
        }),
      })
      await useCurrentUser().fetch()
      const router = mockRouter([
        {
          path: "/requests/:travelAuthorizationId/:stepName",
          name: "my-travel-requests/MyTravelRequestWizardPage",
          component: MyTravelRequestWizardPage,
        },
        {
          path: "/profile",
          name: "ProfilePage",
          component: MyTravelRequestWizardPage,
        },
      ])
      await router.push("/requests/5/confirm-actual-travel-details")
      await router.isReady()
      const wrapper = mountWithDefaultPlugins(MyTravelRequestWizardPage, {
        props: {
          travelAuthorizationId: "5",
          stepName: TravelAuthorizationWizardStepNames.CONFIRM_ACTUAL_TRAVEL_DETAILS,
        },
        global: {
          plugins: [router],
        },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      const destinationInput = wrapper.findAllComponents(LocationsAutocomplete)[3]
      destinationInput.vm.$emit("update:modelValue", 4)
      await flushPromises()
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 4)
      await flushPromises()

      // Assert
      const summaryHeader = wrapper.getComponent(SummaryHeaderPanel)
      expect(summaryHeader.text()).toContain("Ottawa (ON)")
    })

    test("when a multi-city request has no saved destination, does not infer one for the header", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, { arrivalLocationId: 3 })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        primaryDestination: null,
        travelSegments,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/current-user": () => ({
          user: {
            id: 1,
            displayName: "Test Traveler",
            roles: [],
          },
          policy: {},
        }),
        "/api/users/1": () => ({
          user: {
            id: 1,
            firstName: "Test",
            lastName: "Traveler",
          },
        }),
      })
      await useCurrentUser().fetch()
      const router = mockRouter([
        {
          path: "/profile",
          name: "ProfilePage",
          component: MyTravelRequestWizardPage,
        },
      ])
      const wrapper = mountWithDefaultPlugins(SummaryHeaderPanel, {
        props: {
          travelAuthorizationId: 5,
        },
        global: {
          plugins: [router],
        },
      })

      // Act
      await flushPromises()

      // Assert
      const destinationLabel = wrapper.findAll(".text-caption").find((element) => {
        return element.text() === "Primary destination"
      })
      if (!destinationLabel) throw new Error("Primary destination label is missing")

      const destinationText = destinationLabel.element.nextElementSibling?.textContent
      expect(destinationText).toBe("—")
    })
  })
})
