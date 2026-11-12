import { flushPromises } from "@vue/test-utils"
import { VSelect } from "vuetify/components"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment, TravelSegmentAccommodationTypes } from "@/api/travel-segments-api"

import { travelAuthorizationFactory, travelSegmentFactory } from "@/tests/factories"
import {
  mockHttpClient,
  mockHttpGetRoutes,
  mockRouter,
  mountWithDefaultPlugins,
} from "@/tests/support"

import TripDetailsActualsEditForm from "@/components/travel-authorizations/TripDetailsActualsEditForm.vue"

describe("web/src/components/travel-authorizations/TripDetailsActualsEditForm.vue", () => {
  describe("TripDetailsActualsEditForm", () => {
    test("when saved actuals have a selection, retains the actual arrival", async () => {
      // Arrange
      const estimateSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        arrivalLocationId: 2,
        isPrimaryDestination: true,
      })
      const actualSegment1 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        arrivalLocationId: 3,
        isActual: true,
      })
      const actualSegment2 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        arrivalLocationId: 4,
        isActual: true,
        isPrimaryDestination: true,
      })
      const travelSegments = [estimateSegment, actualSegment1, actualSegment2]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 3 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })

      // Act
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Assert
      const primaryDestination = wrapper.getComponent(VSelect)
      expect(primaryDestination.props("modelValue")).toBe(1)
    })

    test("when only estimated legs exist, requires a fresh actual destination choice", async () => {
      // Arrange
      const travelSegments = travelSegmentFactory.buildList(3, {
        travelAuthorizationId: 5,
        arrivalLocationId: 2,
        isPrimaryDestination: true,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments,
      })
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 3 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })

      // Act
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Assert
      const primaryDestination = wrapper.getComponent(VSelect)
      expect(primaryDestination.props("modelValue")).toBeNull()
    })

    test("when an actual arrival is saved, reload retains it independently of estimates", async () => {
      // Arrange
      const estimateSegment1 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
      })
      const estimateSegment2 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        isPrimaryDestination: true,
      })
      const estimateSegments = [estimateSegment1, estimateSegment2]
      let travelSegments = [...estimateSegments]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: travelSegments.length }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
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
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", 0)
      await flushPromises()
      await wrapper.vm.save()
      wrapper.unmount()
      const reloadedWrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Assert
      const primaryDestination = reloadedWrapper.getComponent(VSelect)
      expect(primaryDestination.props("modelValue")).toBe(0)
    })

    test("when estimates seed new actual rows, does not send estimated segment identities", async () => {
      // Arrange
      const outboundSegment = travelSegmentFactory.build({
        id: 41,
        travelAuthorizationId: 5,
        segmentNumber: 1,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
        isPrimaryDestination: true,
      })
      const returnSegment = travelSegmentFactory.build({
        id: 42,
        travelAuthorizationId: 5,
        segmentNumber: 2,
        departureLocationId: 2,
        arrivalLocationId: 1,
        departureOn: "2026-11-12",
        departureTime: "09:00",
      })
      const travelSegments = [outboundSegment, returnSegment]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({ travelAuthorization, policy: {} }),
        "/api/travel-segments": () => ({ travelSegments, totalCount: 2 }),
        "/api/locations": () => ({ locations: [], totalCount: 0 }),
      })
      httpClient.patch.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: { travelAuthorizationId: 5 },
        global: { plugins: [router] },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      const savedAttributes = httpClient.patch.mock.calls[0]?.[1] as {
        travelSegmentActualsAttributes: Partial<TravelSegment>[]
      }
      const actualSegmentIds = savedAttributes.travelSegmentActualsAttributes.map((segment) => {
        return segment.id
      })
      expect(actualSegmentIds).toEqual([undefined, undefined])
    })
  })
})
