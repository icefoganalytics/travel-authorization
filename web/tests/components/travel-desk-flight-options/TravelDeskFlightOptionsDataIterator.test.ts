import { flushPromises, mount } from "@vue/test-utils"
import { VPagination, VTextField } from "vuetify/components"

import travelDeskFlightOptionsApi, { DOES_NOT_WORK } from "@/api/travel-desk-flight-options-api"
import travelDeskFlightSegmentsApi from "@/api/travel-desk-flight-segments-api"

import { mockRouter, mockVuetify } from "@/tests/support"
import travelDeskFlightOptionFactory from "@/tests/factories/travel-desk-flight-option-factory"

import TravelDeskFlightOptionsDataIterator from "@/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue"

vi.mock("@/api/http-client", () => ({
  default: {},
}))
vi.mock("@/api/travel-desk-flight-options-api")
vi.mock("@/api/travel-desk-flight-segments-api")

describe("web/src/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue", () => {
  const vuetify = mockVuetify()
  const travelDeskFlightOptionsApiMock = vi.mocked(travelDeskFlightOptionsApi)
  const travelDeskFlightSegmentsApiMock = vi.mocked(travelDeskFlightSegmentsApi)

  beforeEach(() => {
    travelDeskFlightSegmentsApiMock.list.mockResolvedValue({
      travelDeskFlightSegments: [],
      totalCount: 0,
    })
  })

  describe("TravelDeskFlightOptionsDataIterator", () => {
    describe("pagination", () => {
      test("when mounting on page two, renders every server-provided option without slicing again", async () => {
        // Arrange
        const flightOptions = [6, 7, 8, 9, 10].map((flightPreferenceOrder) =>
          travelDeskFlightOptionFactory.build({ flightPreferenceOrder })
        )
        travelDeskFlightOptionsApiMock.list.mockResolvedValue({
          travelDeskFlightOptions: flightOptions,
          totalCount: 12,
        })
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push({
          path: "/",
          query: { pageFlightOptions1: "2" },
        })
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskFlightOptionsDataIterator, {
          props: {
            routeQuerySuffix: "FlightOptions1",
          },
          global: {
            plugins: [vuetify, router],
          },
        })
        await flushPromises()

        // Assert
        const preferenceFields = wrapper
          .findAllComponents(VTextField)
          .filter((field) => field.props("label") === "Preference")
        expect(preferenceFields.map((field) => field.get("input").element.value)).toEqual([
          "6",
          "7",
          "8",
          "9",
          "10",
        ])
      })

      test("when a saved page is no longer available, renders the remaining options from the last page", async () => {
        // Arrange
        const flightOptions = travelDeskFlightOptionFactory.buildList(3)
        flightOptions.forEach((flightOption, index) => {
          flightOption.flightPreferenceOrder = index + 1
        })
        travelDeskFlightOptionsApiMock.list.mockImplementation(
          async ({ page = 1, perPage = 5 } = {}) => {
            const firstOptionIndex = (page - 1) * perPage
            return {
              travelDeskFlightOptions: flightOptions.slice(
                firstOptionIndex,
                firstOptionIndex + perPage
              ),
              totalCount: flightOptions.length,
            }
          }
        )
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push({
          path: "/",
          query: { pageFlightOptions1: "2" },
        })
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskFlightOptionsDataIterator, {
          props: {
            routeQuerySuffix: "FlightOptions1",
          },
          global: {
            plugins: [vuetify, router],
          },
        })
        await flushPromises()

        // Assert
        const preferenceFields = wrapper
          .findAllComponents(VTextField)
          .filter((field) => field.props("label") === "Preference")
        expect(preferenceFields.map((field) => field.get("input").element.value)).toEqual([
          "1",
          "2",
          "3",
        ])
      })

      test("when advancing the first leg, leaves the second leg on its selected page", async () => {
        // Arrange
        const flightOptions = travelDeskFlightOptionFactory.buildList(5)
        travelDeskFlightOptionsApiMock.list.mockResolvedValue({
          travelDeskFlightOptions: flightOptions,
          totalCount: 25,
        })
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push({
          path: "/",
          query: { pageFlightOptions2: "3" },
        })
        await router.isReady()
        const wrapper = mount(
          {
            components: { TravelDeskFlightOptionsDataIterator },
            template: `
              <div>
                <TravelDeskFlightOptionsDataIterator route-query-suffix="FlightOptions1" />
                <TravelDeskFlightOptionsDataIterator route-query-suffix="FlightOptions2" />
              </div>
            `,
          },
          {
            global: {
              plugins: [vuetify, router],
            },
          }
        )
        await flushPromises()
        const firstLeg = wrapper.findAllComponents(TravelDeskFlightOptionsDataIterator)[0]

        // Act
        await firstLeg.get('button[aria-label="Next page"]').trigger("click")
        await flushPromises()

        // Assert
        expect(
          wrapper.findAll('button[aria-current="true"]').map((button) => button.text())
        ).toEqual(["2", "3"])
      })

      test("when the caller configures three options per page, renders the requested server page", async () => {
        // Arrange
        const flightOptions = travelDeskFlightOptionFactory.buildList(12)
        flightOptions.forEach((flightOption, index) => {
          flightOption.flightPreferenceOrder = index + 1
        })
        travelDeskFlightOptionsApiMock.list.mockImplementation(
          async ({ page = 1, perPage = 5 } = {}) => {
            const firstOptionIndex = (page - 1) * perPage
            return {
              travelDeskFlightOptions: flightOptions.slice(
                firstOptionIndex,
                firstOptionIndex + perPage
              ),
              totalCount: flightOptions.length,
            }
          }
        )
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push({
          path: "/",
          query: { pageFlightOptions1: "2" },
        })
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskFlightOptionsDataIterator, {
          props: {
            routeQuerySuffix: "FlightOptions1",
            defaultPerPage: 3,
          },
          global: {
            plugins: [vuetify, router],
          },
        })
        await flushPromises()

        // Assert
        const preferenceFields = wrapper
          .findAllComponents(VTextField)
          .filter((field) => field.props("label") === "Preference")
        expect(preferenceFields.map((field) => field.get("input").element.value)).toEqual([
          "4",
          "5",
          "6",
        ])
      })

      test("when the URL overrides the caller's page size, restores the URL-sized server page", async () => {
        // Arrange
        const flightOptions = travelDeskFlightOptionFactory.buildList(12)
        flightOptions.forEach((flightOption, index) => {
          flightOption.flightPreferenceOrder = index + 1
        })
        travelDeskFlightOptionsApiMock.list.mockImplementation(
          async ({ page = 1, perPage = 5 } = {}) => {
            const firstOptionIndex = (page - 1) * perPage
            return {
              travelDeskFlightOptions: flightOptions.slice(
                firstOptionIndex,
                firstOptionIndex + perPage
              ),
              totalCount: flightOptions.length,
            }
          }
        )
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push({
          path: "/",
          query: { pageFlightOptions1: "2", perPageFlightOptions1: "2" },
        })
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskFlightOptionsDataIterator, {
          props: {
            routeQuerySuffix: "FlightOptions1",
            defaultPerPage: 4,
          },
          global: {
            plugins: [vuetify, router],
          },
        })
        await flushPromises()

        // Assert
        const preferenceFields = wrapper
          .findAllComponents(VTextField)
          .filter((field) => field.props("label") === "Preference")
        expect(preferenceFields.map((field) => field.get("input").element.value)).toEqual([
          "3",
          "4",
        ])
      })

      test("when both legs have URL page sizes, keeps their page counts independent", async () => {
        // Arrange
        const firstLegOptions = travelDeskFlightOptionFactory.buildList(3, { flightRequestId: 1 })
        const secondLegOptions = travelDeskFlightOptionFactory.buildList(4, { flightRequestId: 2 })
        travelDeskFlightOptionsApiMock.list
          .mockResolvedValueOnce({
            travelDeskFlightOptions: firstLegOptions,
            totalCount: 12,
          })
          .mockResolvedValueOnce({
            travelDeskFlightOptions: secondLegOptions,
            totalCount: 12,
          })
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push({
          path: "/",
          query: {
            pageFlightOptions1: "2",
            perPageFlightOptions1: "3",
            pageFlightOptions2: "2",
            perPageFlightOptions2: "4",
          },
        })
        await router.isReady()

        // Act
        const wrapper = mount(
          {
            components: { TravelDeskFlightOptionsDataIterator },
            template: `
              <div>
                <TravelDeskFlightOptionsDataIterator
                  :where="{ flightRequestId: 1 }"
                  route-query-suffix="FlightOptions1"
                />
                <TravelDeskFlightOptionsDataIterator
                  :where="{ flightRequestId: 2 }"
                  route-query-suffix="FlightOptions2"
                />
              </div>
            `,
          },
          {
            global: {
              plugins: [vuetify, router],
            },
          }
        )
        await flushPromises()

        // Assert
        expect(
          wrapper.findAllComponents(VPagination).map((pager) => pager.props("length"))
        ).toEqual([4, 3])
      })
    })

    describe("traveler preferences", () => {
      test("when an option is rejected and another is unranked, displays distinct preferences", async () => {
        // Arrange
        const rejectedOption = travelDeskFlightOptionFactory.build({
          flightPreferenceOrder: DOES_NOT_WORK,
          additionalInformation: "Arrives too late for the meeting.",
        })
        const unrankedOption = travelDeskFlightOptionFactory.build({
          flightPreferenceOrder: null,
        })
        travelDeskFlightOptionsApiMock.list.mockResolvedValue({
          travelDeskFlightOptions: [rejectedOption, unrankedOption],
          totalCount: 2,
        })
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push("/")
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskFlightOptionsDataIterator, {
          props: {
            routeQuerySuffix: "FlightOptions1",
          },
          global: {
            plugins: [vuetify, router],
          },
        })
        await flushPromises()

        // Assert
        const preferenceFields = wrapper
          .findAllComponents(VTextField)
          .filter((field) => field.props("label") === "Preference")
        expect(preferenceFields.map((field) => field.get("input").element.value)).toEqual([
          "Does Not Work",
          "Not Ranked",
        ])
      })

      test("when a rejected option has an explanation, displays the traveler's note", async () => {
        // Arrange
        const rejectedOption = travelDeskFlightOptionFactory.build({
          flightPreferenceOrder: DOES_NOT_WORK,
          additionalInformation: "Arrives too late for the meeting.",
        })
        travelDeskFlightOptionsApiMock.list.mockResolvedValue({
          travelDeskFlightOptions: [rejectedOption],
          totalCount: 1,
        })
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push("/")
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskFlightOptionsDataIterator, {
          props: {
            routeQuerySuffix: "FlightOptions1",
          },
          global: {
            plugins: [vuetify, router],
          },
        })
        await flushPromises()

        // Assert
        expect(wrapper.get("textarea").element.value).toEqual("Arrives too late for the meeting.")
      })
    })
  })
})
