import { flushPromises } from "@vue/test-utils"
import { VAutocomplete } from "vuetify/components"

import {
  TravelAuthorizationStatuses,
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
import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"
import TravelSegmentsAttributesMultiCityTripSection from "@/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue"
import MyTravelRequestWizardPage from "@/pages/my-travel-requests/MyTravelRequestWizardPage.vue"

import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"

describe("web/src/components/travel-authorizations/SummaryHeaderPanel.vue", () => {
  describe("SummaryHeaderPanel", () => {
    beforeEach(() => {
      vi.spyOn(window, "scrollTo").mockReturnValue(undefined)
    })

    test("when the early Final Destination choice changes, updates the wizard summary header", async () => {
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
        "/api/travel-purposes": () => ({
          travelPurposes: [{ id: 1, purpose: "Meeting" }],
          totalCount: 1,
        }),
        "/api/travel-purposes/1": () => ({
          travelPurpose: { id: 1, purpose: "Meeting" },
        }),
        "/api/expenses": () => ({ expenses: [], totalCount: 0 }),
        "/api/travel-authorizations/5/wizard": () => ({
          travelAuthorization: {
            id: 5,
            status: travelAuthorization.status,
            wizardStepName: TravelAuthorizationWizardStepNames.EDIT_PURPOSE_DETAILS,
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
      await router.push("/requests/5/edit-purpose-details")
      await router.isReady()
      const wrapper = mountWithDefaultPlugins(MyTravelRequestWizardPage, {
        props: {
          travelAuthorizationId: "5",
          stepName: TravelAuthorizationWizardStepNames.EDIT_PURPOSE_DETAILS,
        },
        global: {
          plugins: [router],
        },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      const purposeForm = wrapper.getComponent(PurposeEditFormCard)
      const destinationInput = purposeForm.getComponent(LocationsAutocomplete)
      destinationInput.vm.$emit("update:modelValue", 4)
      await flushPromises()

      // Assert
      const summaryHeader = wrapper.getComponent(SummaryHeaderPanel)
      expect(summaryHeader.text()).toContain("Ottawa (ON)")
    })

    test("when the last actual arrival city changes, keeps the saved Final Destination in the summary", async () => {
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
      const whitehorse = locationFactory.build({ id: 1, city: "Whitehorse", province: "YT" })
      const vancouver = locationFactory.build({ id: 2, city: "Vancouver", province: "BC" })
      const toronto = locationFactory.build({ id: 3, city: "Toronto", province: "ON" })
      const ottawa = locationFactory.build({ id: 4, city: "Ottawa", province: "ON" })
      const locations = [whitehorse, vancouver, toronto, ottawa]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        finalDestinationLocationId: 4,
        finalDestination: ottawa,
        userId: 1,
        purposeId: 1,
        status: TravelAuthorizationStatuses.APPROVED,
        wizardStepName: TravelAuthorizationWizardStepNames.CONFIRM_ACTUAL_TRAVEL_DETAILS,
        isDraft: false,
        isApproved: true,
        isTravellingByAir: true,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: null,
        travelSegments,
      })
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
      const routeEditor = wrapper.getComponent(TravelSegmentsAttributesMultiCityTripSection)
      const lastLegArrival = routeEditor
        .findAllComponents(LocationsAutocomplete)
        .find((control) => {
          return (
            control.props("modelValue") === whitehorse.id &&
            control.getComponent(VAutocomplete).props("label") === "To"
          )
        })
      if (!lastLegArrival) {
        throw new Error("Missing arrival city control for the last leg")
      }

      lastLegArrival.vm.$emit("update:modelValue", vancouver.id)
      await flushPromises()

      // Assert
      const summaryHeader = wrapper.getComponent(SummaryHeaderPanel)
      expect(summaryHeader.text()).toContain("Ottawa (ON)")
    })

    test("when a multi-city request has no saved destination, does not infer one for the header", async () => {
      // Arrange
      const whitehorse = locationFactory.build({
        id: 1,
        city: "Whitehorse",
        province: "YT",
      })
      const vancouver = locationFactory.build({
        id: 2,
        city: "Vancouver",
        province: "BC",
      })
      const toronto = locationFactory.build({
        id: 3,
        city: "Toronto",
        province: "ON",
      })
      const outboundSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: whitehorse.id,
        arrivalLocationId: vancouver.id,
        departureOn: "2026-11-12",
      })
      const connectingSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: vancouver.id,
        arrivalLocationId: toronto.id,
        departureOn: "2026-11-13",
      })
      const returnSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 3,
        departureLocationId: toronto.id,
        arrivalLocationId: whitehorse.id,
        departureOn: "2026-11-14",
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        userId: 1,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        finalDestination: null,
        travelSegments: [outboundSegment, connectingSegment, returnSegment],
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/locations/1": () => ({
          location: whitehorse,
        }),
        "/api/locations/2": () => ({
          location: vancouver,
        }),
        "/api/locations/3": () => ({
          location: toronto,
        }),
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
        return element.text() === "Destination"
      })
      if (!destinationLabel) {
        throw new Error("Destination label is missing")
      }

      const destinationText = destinationLabel.element.nextElementSibling?.textContent
      expect(destinationText).toBe("—")
    })
  })
})
