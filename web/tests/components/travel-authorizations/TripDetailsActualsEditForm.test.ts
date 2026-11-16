import { flushPromises } from "@vue/test-utils"
import { omit } from "lodash"
import { VSelect } from "vuetify/components"

import {
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
} from "@/api/travel-authorizations-api"
import { type TravelSegment, TravelSegmentAccommodationTypes } from "@/api/travel-segments-api"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/tests/factories"
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
        return {
          data: {
            travelAuthorization,
            policy: {},
          },
        }
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
      httpClient.patch.mockResolvedValue({
        data: {
          travelAuthorization,
          policy: {},
        },
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
      await wrapper.vm.save()

      // Assert
      const expectedActualSegments = travelSegments.map((segment, index) => {
        const attributes = omit(segment, ["id", "createdAt", "updatedAt"])
        return {
          ...attributes,
          id: undefined,
          isActual: true,
          isPrimaryDestination: false,
          segmentNumber: index + 1,
        }
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: expectedActualSegments,
      })
    })

    test("when more than ten mixed-phase legs exist, saves every actual leg with its identity", async () => {
      // Arrange
      const estimatedSegments = travelSegmentFactory.buildList(6, {
        travelAuthorizationId: 5,
        departureLocationId: 1,
        arrivalLocationId: 2,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
        isActual: false,
        isPrimaryDestination: false,
      })
      const actualSegments = travelSegmentFactory.buildList(6, {
        travelAuthorizationId: 5,
        departureLocationId: 1,
        arrivalLocationId: 3,
        departureOn: "2026-11-12",
        departureTime: "09:00",
        accommodationType: TravelSegmentAccommodationTypes.HOTEL,
        isActual: true,
        isPrimaryDestination: false,
      })
      actualSegments[5].isPrimaryDestination = true
      const travelSegments = estimatedSegments.flatMap((estimatedSegment, index) => {
        estimatedSegment.segmentNumber = index + 1
        actualSegments[index].segmentNumber = index + 1
        return [estimatedSegment, actualSegments[index]]
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        tripTypeEstimate: TravelAuthorizationTripTypes.MULTI_CITY,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({
          travelAuthorization,
          policy: {},
        }),
        "/api/travel-segments": (config) => {
          const pageSize = config?.params?.perPage === -1 ? travelSegments.length : 10
          const paginatedSegments = travelSegments.slice(0, pageSize)
          return {
            travelSegments: paginatedSegments,
            totalCount: travelSegments.length,
          }
        },
        "/api/locations": () => ({
          locations: [],
          totalCount: 0,
        }),
      })
      httpClient.patch.mockResolvedValue({
        data: {
          travelAuthorization,
          policy: {},
        },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: {
          travelAuthorizationId: 5,
        },
        global: {
          plugins: [router],
        },
      })
      await flushPromises()
      await vi.dynamicImportSettled()
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      const expectedActualSegments = actualSegments.map((segment, index) => {
        const attributes = omit(segment, ["createdAt", "updatedAt"])
        return {
          ...attributes,
          accommodationType: index === 5 ? null : TravelSegmentAccommodationTypes.HOTEL,
        }
      })
      expect(httpClient.patch).toHaveBeenCalledWith("/api/travel-authorizations/5", {
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelDurationActual: 1,
        daysOffTravelStatusActual: 0,
        dateBackToWorkActual: "2026-11-14",
        travelSegmentActualsAttributes: expectedActualSegments,
      })
    })

    test("when a returned legacy claim chooses an arrival, saves only that actual marker", async () => {
      // Arrange
      const estimatedSegment = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        arrivalLocationId: 2,
        isPrimaryDestination: true,
      })
      const actualSegment1 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 1,
        arrivalLocationId: 3,
        isActual: true,
      })
      const actualSegment2 = travelSegmentFactory.build({
        travelAuthorizationId: 5,
        segmentNumber: 2,
        arrivalLocationId: 4,
        isActual: true,
      })
      const travelSegments = [estimatedSegment, actualSegment1, actualSegment2]
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        status: TravelAuthorizationStatuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments,
      })
      const selectedArrival = locationFactory.build({
        id: 4,
        city: "Ottawa",
        province: "ON",
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({
          travelAuthorization,
          policy: {},
        }),
        "/api/travel-segments": () => ({
          travelSegments,
          totalCount: 3,
        }),
        "/api/locations/4": () => ({
          location: selectedArrival,
        }),
      })
      httpClient.patch.mockResolvedValue({
        data: {
          travelSegment: actualSegment2,
          policy: {},
        },
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: {
          travelAuthorizationId: 5,
        },
        global: {
          plugins: [router],
        },
      })
      await flushPromises()

      // Act
      wrapper.getComponent(VSelect).vm.$emit("update:modelValue", actualSegment2.id)
      await flushPromises()
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith(`/api/travel-segments/${actualSegment2.id}`, {
        isPrimaryDestination: true,
      })
    })

    test("when a returned legacy claim has no choice, does not save an inferred destination", async () => {
      // Arrange
      const actualSegments = travelSegmentFactory.buildList(2, {
        travelAuthorizationId: 5,
        arrivalLocationId: 3,
        isActual: true,
        isPrimaryDestination: false,
      })
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        status: TravelAuthorizationStatuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        tripTypeActual: TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments: actualSegments,
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        "/api/travel-authorizations/5": () => ({
          travelAuthorization,
          policy: {},
        }),
        "/api/travel-segments": () => ({
          travelSegments: actualSegments,
          totalCount: 2,
        }),
      })
      const router = mockRouter()
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TripDetailsActualsEditForm, {
        props: {
          travelAuthorizationId: 5,
        },
        global: {
          plugins: [router],
        },
      })
      await flushPromises()

      // Act
      await wrapper.vm.save()

      // Assert
      expect(httpClient.patch).not.toHaveBeenCalled()
    })
  })
})
