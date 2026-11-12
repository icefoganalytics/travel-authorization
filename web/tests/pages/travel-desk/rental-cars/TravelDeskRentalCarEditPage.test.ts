import { flushPromises, mount } from "@vue/test-utils"

import StringDateInput from "@/components/common/StringDateInput.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import {
  locationFactory,
  travelDeskFlightSegmentFactory,
  travelDeskRentalCarFactory,
} from "@/tests/factories"
import { mockHttpClient, mockHttpGetRoutes, mockRouter, mockVuetify } from "@/tests/support"

import TravelDeskRentalCarEditPage from "@/pages/travel-desk/rental-cars/TravelDeskRentalCarEditPage.vue"

describe("web/src/pages/travel-desk/rental-cars/TravelDeskRentalCarEditPage.vue", () => {
  describe("TravelDeskRentalCarEditPage", () => {
    test.each(["before", "after"])(
      "when flights arrive %s switching No then Yes, saving rematches the actual flight dates and times",
      async (flightArrival) => {
        // Arrange
        const httpClient = mockHttpClient()
        const rentalCar = travelDeskRentalCarFactory.build({
          id: 15,
          travelRequestId: 42,
          pickUpCity: "Dawson (YT)",
          matchFlightTimes: true,
          pickUpDate: "2026-12-01T09:15:00.000Z",
          dropOffDate: "2026-12-05T18:45:00.000Z",
        })
        const location = locationFactory.build({ city: "Dawson", province: "YT" })
        const firstFlightSegment = travelDeskFlightSegmentFactory.build({
          id: 1,
          flightOptionId: 8,
          departAt: "2026-12-02T06:25:00.000Z",
          arriveAt: "2026-12-02T08:00:00.000Z",
        })
        const lastFlightSegment = travelDeskFlightSegmentFactory.build({
          id: 2,
          flightOptionId: 8,
          departAt: "2026-12-06T17:00:00.000Z",
          arriveAt: "2026-12-06T20:40:00.000Z",
        })
        const flightResponse = Promise.withResolvers<void>()
        if (flightArrival === "before") {
          flightResponse.resolve()
        }
        mockHttpGetRoutes({
          "/api/travel-desk-rental-cars/15": () => ({
            travelDeskRentalCar: { ...rentalCar },
            policy: {},
          }),
          "/api/travel-desk-flight-segments": async (configuration) => {
            await flightResponse.promise
            if (configuration?.params.order[0][0] === "departAt") {
              return { travelDeskFlightSegments: [firstFlightSegment], totalCount: 1 }
            }

            return { travelDeskFlightSegments: [lastFlightSegment], totalCount: 1 }
          },
          "/api/travel-authorizations": () => ({ travelAuthorizations: [], totalCount: 0 }),
          "/api/locations": () => ({ locations: [location], totalCount: 1 }),
        })
        const router = mockRouter([
          {
            path: "/requests/:travelDeskTravelRequestId",
            name: "travel-desk/TravelDeskRequestEditRedirect",
            component: { template: "<div />" },
          },
        ])
        await router.push("/requests/42")
        await router.isReady()
        const wrapper = mount(TravelDeskRentalCarEditPage, {
          props: { travelDeskTravelRequestId: "42", travelDeskRentalCarId: "15" },
          global: { plugins: [mockVuetify(), router] },
        })
        await flushPromises()

        // Act
        const matchingQuestion = wrapper.findAllComponents(YesNoRowRadioGroup)[0]
        await matchingQuestion.get('input[value="false"]').setValue()
        await matchingQuestion.get('input[value="true"]').setValue()
        flightResponse.resolve()
        await flushPromises()
        await wrapper.get("form").trigger("submit")
        await flushPromises()

        // Assert
        expect(httpClient.patch).toHaveBeenCalledWith(
          "/api/travel-desk-rental-cars/15",
          expect.objectContaining({
            matchFlightTimes: true,
            pickUpDate: "2026-12-02T06:25:00.000Z",
            dropOffDate: "2026-12-06T20:40:00.000Z",
          })
        )
      }
    )

    test("when saved matching is already Yes, reopening and saving preserves the custom city and schedule", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      const rentalCar = travelDeskRentalCarFactory.build({
        id: 15,
        travelRequestId: 42,
        pickUpCity: "Dawson (YT)",
        matchFlightTimes: true,
        pickUpDate: "2026-12-01T09:15:00.000Z",
        dropOffDate: "2026-12-05T18:45:00.000Z",
      })
      const location = locationFactory.build({ city: "Dawson", province: "YT" })
      const flightSegment = travelDeskFlightSegmentFactory.build({
        id: 1,
        flightOptionId: 8,
        departAt: "2026-12-02T06:25:00.000Z",
        arriveAt: "2026-12-06T20:40:00.000Z",
      })
      mockHttpGetRoutes({
        "/api/travel-desk-rental-cars/15": () => ({
          travelDeskRentalCar: { ...rentalCar },
          policy: {},
        }),
        "/api/travel-desk-flight-segments": () => ({
          travelDeskFlightSegments: [flightSegment],
          totalCount: 1,
        }),
        "/api/travel-authorizations": () => ({ travelAuthorizations: [], totalCount: 0 }),
        "/api/locations": () => ({ locations: [location], totalCount: 1 }),
      })
      const router = mockRouter([
        {
          path: "/requests/:travelDeskTravelRequestId",
          name: "travel-desk/TravelDeskRequestEditRedirect",
          component: { template: "<div />" },
        },
      ])
      await router.push("/requests/42")
      await router.isReady()
      const wrapper = mount(TravelDeskRentalCarEditPage, {
        props: { travelDeskTravelRequestId: "42", travelDeskRentalCarId: "15" },
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith(
        "/api/travel-desk-rental-cars/15",
        expect.objectContaining({
          matchFlightTimes: true,
          pickUpCity: "Dawson (YT)",
          pickUpDate: "2026-12-01T09:15:00.000Z",
          dropOffDate: "2026-12-05T18:45:00.000Z",
        })
      )
    })

    test("when matching is turned off after rematching, saving restores the saved rental schedule", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      const rentalCar = travelDeskRentalCarFactory.build({
        id: 15,
        travelRequestId: 42,
        pickUpCity: "Dawson (YT)",
        matchFlightTimes: true,
        pickUpDate: "2026-12-01T09:15:00.000Z",
        dropOffDate: "2026-12-05T18:45:00.000Z",
      })
      const location = locationFactory.build({ city: "Dawson", province: "YT" })
      const flightSegment = travelDeskFlightSegmentFactory.build({
        departAt: "2026-12-02T06:25:00.000Z",
        arriveAt: "2026-12-06T20:40:00.000Z",
      })
      mockHttpGetRoutes({
        "/api/travel-desk-rental-cars/15": () => ({
          travelDeskRentalCar: { ...rentalCar },
          policy: {},
        }),
        "/api/travel-desk-flight-segments": () => ({
          travelDeskFlightSegments: [flightSegment],
          totalCount: 1,
        }),
        "/api/travel-authorizations": () => ({ travelAuthorizations: [], totalCount: 0 }),
        "/api/locations": () => ({ locations: [location], totalCount: 1 }),
      })
      const router = mockRouter([
        {
          path: "/requests/:travelDeskTravelRequestId",
          name: "travel-desk/TravelDeskRequestEditRedirect",
          component: { template: "<div />" },
        },
      ])
      await router.push("/requests/42")
      await router.isReady()
      const wrapper = mount(TravelDeskRentalCarEditPage, {
        props: { travelDeskTravelRequestId: "42", travelDeskRentalCarId: "15" },
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      const matchingQuestion = wrapper.getComponent(YesNoRowRadioGroup)
      await matchingQuestion.get('input[value="false"]').setValue()
      await matchingQuestion.get('input[value="true"]').setValue()
      await matchingQuestion.get('input[value="false"]').setValue()
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith(
        "/api/travel-desk-rental-cars/15",
        expect.objectContaining({
          matchFlightTimes: false,
          pickUpDate: "2026-12-01T09:15:00.000Z",
          dropOffDate: "2026-12-05T18:45:00.000Z",
        })
      )
    })

    test.each(["before", "after"])(
      "when pending flights arrive %s selecting No, saving retains manual changes across repeated matching",
      async (flightArrival) => {
        // Arrange
        const httpClient = mockHttpClient()
        const rentalCar = travelDeskRentalCarFactory.build({
          id: 15,
          travelRequestId: 42,
          pickUpCity: "Dawson (YT)",
          matchFlightTimes: false,
          pickUpDate: "2026-12-01T09:15:00.000Z",
          dropOffDate: "2026-12-05T18:45:00.000Z",
        })
        const location = locationFactory.build({ city: "Dawson", province: "YT" })
        const flightSegment = travelDeskFlightSegmentFactory.build({
          departAt: "2026-12-02T06:25:00.000Z",
          arriveAt: "2026-12-06T20:40:00.000Z",
        })
        const flightResponse = Promise.withResolvers<void>()
        mockHttpGetRoutes({
          "/api/travel-desk-rental-cars/15": () => ({
            travelDeskRentalCar: { ...rentalCar },
            policy: {},
          }),
          "/api/travel-desk-flight-segments": async () => {
            await flightResponse.promise
            return { travelDeskFlightSegments: [flightSegment], totalCount: 1 }
          },
          "/api/travel-authorizations": () => ({ travelAuthorizations: [], totalCount: 0 }),
          "/api/locations": () => ({ locations: [location], totalCount: 1 }),
        })
        const router = mockRouter([
          {
            path: "/requests/:travelDeskTravelRequestId",
            name: "travel-desk/TravelDeskRequestEditRedirect",
            component: { template: "<div />" },
          },
        ])
        await router.push("/requests/42")
        await router.isReady()
        const wrapper = mount(TravelDeskRentalCarEditPage, {
          props: { travelDeskTravelRequestId: "42", travelDeskRentalCarId: "15" },
          global: { plugins: [mockVuetify(), router] },
        })
        await flushPromises()

        // Act
        const matchingQuestion = wrapper.getComponent(YesNoRowRadioGroup)
        await matchingQuestion.get('input[value="true"]').setValue()
        await wrapper.findAllComponents(StringDateInput)[0].setValue("2026-12-03")
        await wrapper.findAllComponents(StringDateInput)[1].setValue("2026-12-07")
        await wrapper.findAllComponents(TimeTextField)[0].get("input").setValue("10:20")
        await wrapper.findAllComponents(TimeTextField)[1].get("input").setValue("19:30")
        if (flightArrival === "before") {
          flightResponse.resolve()
          await flushPromises()
        }
        await matchingQuestion.get('input[value="false"]').setValue()
        flightResponse.resolve()
        await flushPromises()
        await matchingQuestion.get('input[value="true"]').setValue()
        await matchingQuestion.get('input[value="false"]').setValue()
        await wrapper.get("form").trigger("submit")
        await flushPromises()

        // Assert
        expect(httpClient.patch).toHaveBeenCalledWith(
          "/api/travel-desk-rental-cars/15",
          expect.objectContaining({
            matchFlightTimes: false,
            pickUpDate: "2026-12-03T10:20:00.000Z",
            dropOffDate: "2026-12-07T19:30:00.000Z",
          })
        )
      }
    )

    test("when matching has no flight schedule, the user can edit and save the manual times", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      const rentalCar = travelDeskRentalCarFactory.build({
        id: 15,
        travelRequestId: 42,
        matchFlightTimes: false,
        pickUpDate: "2026-12-01T09:15:00.000Z",
        dropOffDate: "2026-12-05T18:45:00.000Z",
      })
      const location = locationFactory.build({ city: "Dawson", province: "YT" })
      mockHttpGetRoutes({
        "/api/travel-desk-rental-cars/15": () => ({
          travelDeskRentalCar: { ...rentalCar },
          policy: {},
        }),
        "/api/travel-desk-flight-segments": () => ({
          travelDeskFlightSegments: [],
          totalCount: 0,
        }),
        "/api/travel-authorizations": () => ({ travelAuthorizations: [], totalCount: 0 }),
        "/api/locations": () => ({ locations: [location], totalCount: 1 }),
      })
      const router = mockRouter([
        {
          path: "/requests/:travelDeskTravelRequestId",
          name: "travel-desk/TravelDeskRequestEditRedirect",
          component: { template: "<div />" },
        },
      ])
      await router.push("/requests/42")
      await router.isReady()
      const wrapper = mount(TravelDeskRentalCarEditPage, {
        props: { travelDeskTravelRequestId: "42", travelDeskRentalCarId: "15" },
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      const matchingQuestion = wrapper.findAllComponents(YesNoRowRadioGroup)[0]
      await matchingQuestion.get('input[value="true"]').setValue()
      const timeFields = wrapper.findAllComponents(TimeTextField)
      await timeFields[0].get("input").setValue("10:20")
      await timeFields[1].get("input").setValue("19:30")
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith(
        "/api/travel-desk-rental-cars/15",
        expect.objectContaining({
          matchFlightTimes: true,
          pickUpDate: "2026-12-01T10:20:00.000Z",
          dropOffDate: "2026-12-05T19:30:00.000Z",
        })
      )
    })
  })
})
