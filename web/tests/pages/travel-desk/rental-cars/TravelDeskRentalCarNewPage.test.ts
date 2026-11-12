import { flushPromises, mount } from "@vue/test-utils"

import { TravelDeskRentalCarLocationTypes } from "@/api/travel-desk-rental-cars-api"
import {
  locationFactory,
  travelAuthorizationFactory,
  travelDeskFlightSegmentFactory,
} from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

import StringDateInput from "@/components/common/StringDateInput.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelDeskRentalCarLocationTypeSelect from "@/components/travel-desk-rental-cars/TravelDeskRentalCarLocationTypeSelect.vue"
import TravelDeskRentalCarNewPage from "@/pages/travel-desk/rental-cars/TravelDeskRentalCarNewPage.vue"

describe("web/src/pages/travel-desk/rental-cars/TravelDeskRentalCarNewPage.vue", () => {
  describe("TravelDeskRentalCarNewPage", () => {
    test.each(["before", "after"])(
      "when flights arrive %s selecting matching, saving uses the flight dates and actual times",
      async (flightArrival) => {
        // Arrange
        const httpClient = mockHttpClient()
        const destination = locationFactory.build({ city: "Vancouver", province: "BC" })
        const travelAuthorization = {
          ...travelAuthorizationFactory.build({ dateBackToWorkEstimate: "2026-12-12" }),
          departingAt: "2026-12-10T08:35:00.000Z",
          finalDestination: destination,
        }
        const flightSegment = travelDeskFlightSegmentFactory.build({
          id: 41,
          flightOptionId: 15,
          departAt: "2026-12-10T08:35:00.000Z",
          arriveAt: "2026-12-12T19:45:00.000Z",
        })
        const flightResponse = Promise.withResolvers<void>()
        if (flightArrival === "before") {
          flightResponse.resolve()
        }
        httpClient.get.mockImplementation(async (url) => {
          if (url === "/api/travel-authorizations") {
            return { data: { travelAuthorizations: [travelAuthorization], totalCount: 1 } }
          }

          if (url === "/api/travel-desk-flight-segments") {
            await flightResponse.promise
            return { data: { travelDeskFlightSegments: [flightSegment], totalCount: 1 } }
          }

          return { data: { locations: [destination], totalCount: 1 } }
        })
        const router = mockRouter([
          {
            path: "/requests/:travelDeskTravelRequestId",
            name: "travel-desk/TravelDeskRequestEditRedirect",
            component: { template: "<div />" },
          },
        ])
        await router.push("/requests/900")
        await router.isReady()
        const wrapper = mount(TravelDeskRentalCarNewPage, {
          props: { travelDeskTravelRequestId: "900" },
          attachTo: document.body,
          global: { plugins: [mockVuetify(), router] },
        })
        await flushPromises()

        // Act
        await wrapper
          .getComponent(TravelDeskRentalCarLocationTypeSelect)
          .setValue(TravelDeskRentalCarLocationTypes.AIRPORT)
        await wrapper.getComponent(YesNoRowRadioGroup).get('input[type="radio"]').setValue(true)
        flightResponse.resolve()
        await flushPromises()
        await wrapper.get("form").trigger("submit")
        await flushPromises()

        // Assert
        expect(httpClient.post).toHaveBeenCalledWith(
          "/api/travel-desk-rental-cars",
          expect.objectContaining({
            pickUpCity: "Vancouver (BC)",
            pickUpDate: "2026-12-10T08:35:00.000Z",
            dropOffDate: "2026-12-12T19:45:00.000Z",
            matchFlightTimes: true,
          })
        )
      }
    )

    test("when flights are missing after entering only pickup, saving leaves a correctable required dropoff error", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      const destination = locationFactory.build({ city: "Vancouver", province: "BC" })
      const travelAuthorization = {
        ...travelAuthorizationFactory.build({ dateBackToWorkEstimate: "2026-12-12" }),
        departingAt: "2026-12-10T08:35:00.000Z",
        finalDestination: destination,
      }
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/travel-authorizations") {
          return { data: { travelAuthorizations: [travelAuthorization], totalCount: 1 } }
        }

        if (url === "/api/travel-desk-flight-segments") {
          return { data: { travelDeskFlightSegments: [], totalCount: 0 } }
        }

        return { data: { locations: [destination], totalCount: 1 } }
      })
      const router = mockRouter([
        {
          path: "/requests/:travelDeskTravelRequestId",
          name: "travel-desk/TravelDeskRequestEditRedirect",
          component: { template: "<div />" },
        },
      ])
      await router.push("/requests/900")
      await router.isReady()
      const wrapper = mount(TravelDeskRentalCarNewPage, {
        props: { travelDeskTravelRequestId: "900" },
        attachTo: document.body,
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      await wrapper.getComponent(StringDateInput).setValue("2026-12-10")
      await wrapper
        .getComponent(TravelDeskRentalCarLocationTypeSelect)
        .setValue(TravelDeskRentalCarLocationTypes.AIRPORT)
      await wrapper.getComponent(YesNoRowRadioGroup).get('input[type="radio"]').setValue(true)
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      const dropOffDateField = wrapper.findAllComponents(StringDateInput)[1]
      const dropOffDateError = dropOffDateField.get(".v-messages").text()
      expect(dropOffDateError).toEqual("This field is required")
    })

    test("when destination arrives after a city is chosen, saving retains the chosen city", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      const destination = locationFactory.build({ city: "Vancouver", province: "BC" })
      const chosenCity = locationFactory.build({ city: "Victoria", province: "BC" })
      const travelAuthorization = {
        ...travelAuthorizationFactory.build({ dateBackToWorkEstimate: "2026-12-12" }),
        departingAt: "2026-12-10T08:35:00.000Z",
        finalDestination: destination,
      }
      const destinationResponse = Promise.withResolvers<{
        data: {
          travelAuthorizations: (typeof travelAuthorization)[]
          totalCount: number
        }
      }>()
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/travel-authorizations") {
          return destinationResponse.promise
        }

        if (url === "/api/travel-desk-flight-segments") {
          return { data: { travelDeskFlightSegments: [], totalCount: 0 } }
        }

        return { data: { locations: [destination, chosenCity], totalCount: 2 } }
      })
      const router = mockRouter([
        {
          path: "/requests/:travelDeskTravelRequestId",
          name: "travel-desk/TravelDeskRequestEditRedirect",
          component: { template: "<div />" },
        },
      ])
      await router.push("/requests/900")
      await router.isReady()
      const wrapper = mount(TravelDeskRentalCarNewPage, {
        props: { travelDeskTravelRequestId: "900" },
        attachTo: document.body,
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      await wrapper.getComponent(LocationsAutocomplete).setValue("Victoria (BC)")
      destinationResponse.resolve({
        data: { travelAuthorizations: [travelAuthorization], totalCount: 1 },
      })
      await flushPromises()
      await wrapper.findAllComponents(StringDateInput)[0].setValue("2026-12-10")
      await wrapper.findAllComponents(StringDateInput)[1].setValue("2026-12-12")
      await wrapper
        .getComponent(TravelDeskRentalCarLocationTypeSelect)
        .setValue(TravelDeskRentalCarLocationTypes.AIRPORT)
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        "/api/travel-desk-rental-cars",
        expect.objectContaining({ pickUpCity: "Victoria (BC)" })
      )
    })
  })
})
