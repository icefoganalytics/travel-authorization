import { flushPromises, mount } from "@vue/test-utils"

import {
  locationFactory,
  travelDeskFlightSegmentFactory,
  travelDeskRentalCarFactory,
} from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

import TimeTextField from "@/components/common/TimeTextField.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"
import TravelDeskRentalCarEditPage from "@/pages/travel-desk/rental-cars/TravelDeskRentalCarEditPage.vue"

describe("web/src/pages/travel-desk/rental-cars/TravelDeskRentalCarEditPage.vue", () => {
  describe("TravelDeskRentalCarEditPage", () => {
    test("when the user switches No then Yes, saving rematches the actual flight dates and times", async () => {
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
      httpClient.get.mockImplementation(async (url, configuration) => {
        if (url === "/api/travel-desk-rental-cars/15") {
          return { data: { travelDeskRentalCar: { ...rentalCar }, policy: {} } }
        }
        if (url === "/api/travel-desk-flight-segments") {
          if (configuration?.params.order[0][0] === "departAt") {
            return {
              data: {
                travelDeskFlightSegments: [firstFlightSegment],
                totalCount: 1,
              },
            }
          }

          return {
            data: {
              travelDeskFlightSegments: [lastFlightSegment],
              totalCount: 1,
            },
          }
        }

        return { data: { travelAuthorizations: [], locations: [location], totalCount: 1 } }
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
    })

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
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/travel-desk-rental-cars/15") {
          return { data: { travelDeskRentalCar: { ...rentalCar }, policy: {} } }
        }
        if (url === "/api/travel-desk-flight-segments") {
          return {
            data: {
              travelDeskFlightSegments: [flightSegment],
              totalCount: 1,
            },
          }
        }

        return { data: { travelAuthorizations: [], locations: [location], totalCount: 1 } }
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
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/travel-desk-rental-cars/15") {
          return { data: { travelDeskRentalCar: { ...rentalCar }, policy: {} } }
        }

        return {
          data: {
            travelDeskFlightSegments: [],
            travelAuthorizations: [],
            locations: [location],
            totalCount: 0,
          },
        }
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
