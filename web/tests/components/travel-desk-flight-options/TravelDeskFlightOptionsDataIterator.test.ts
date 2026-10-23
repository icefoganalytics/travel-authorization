import { flushPromises, mount } from "@vue/test-utils"

import travelDeskFlightOptionsApi, { DOES_NOT_WORK } from "@/api/travel-desk-flight-options-api"
import travelDeskFlightSegmentsApi from "@/api/travel-desk-flight-segments-api"

import { mockRouter, mockVuetify } from "@/tests/support"
import travelDeskFlightOptionFactory from "@/tests/factories/travel-desk-flight-option-factory"

import TravelDeskFlightOptionsDataIterator from "@/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue"
import TravelDeskFlightOptionCard from "@/components/travel-desk-flight-options/TravelDeskFlightOptionCard.vue"

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
        const preferenceInputs = wrapper
          .findAllComponents(TravelDeskFlightOptionCard)
          .map((card) => card.get("input").element)
        expect(preferenceInputs).toEqual([
          expect.objectContaining({
            value: "6",
          }),
          expect.objectContaining({
            value: "7",
          }),
          expect.objectContaining({
            value: "8",
          }),
          expect.objectContaining({
            value: "9",
          }),
          expect.objectContaining({
            value: "10",
          }),
        ])
      })

      test("when advancing the outbound leg, shows its next options without changing the return leg", async () => {
        // Arrange
        const outboundOptions = travelDeskFlightOptionFactory.buildList(7, { flightRequestId: 1 })
        outboundOptions.forEach((option, index) => {
          option.flightPreferenceOrder = index + 1
        })
        const returnOptions = travelDeskFlightOptionFactory.buildList(12, { flightRequestId: 2 })
        returnOptions.forEach((option, index) => {
          option.flightPreferenceOrder = 12 - index
        })
        const flightOptions = [...outboundOptions, ...returnOptions]
        travelDeskFlightOptionsApiMock.list.mockImplementation(
          async ({ where, page = 1, perPage = 5 } = {}) => {
            const legOptions = flightOptions.filter(
              (option) => option.flightRequestId === where?.flightRequestId
            )
            return {
              travelDeskFlightOptions: legOptions.slice((page - 1) * perPage, page * perPage),
              totalCount: legOptions.length,
            }
          }
        )
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
        const outboundLeg = wrapper.findAllComponents(TravelDeskFlightOptionsDataIterator)[0]

        // Act
        await outboundLeg.get('button[aria-label="Next page"]').trigger("click")
        await flushPromises()

        // Assert
        const preferenceInputs = wrapper
          .findAllComponents(TravelDeskFlightOptionCard)
          .map((card) => card.get("input").element)
        expect(preferenceInputs).toEqual([
          expect.objectContaining({
            value: "6",
          }),
          expect.objectContaining({
            value: "7",
          }),
          expect.objectContaining({
            value: "2",
          }),
          expect.objectContaining({
            value: "1",
          }),
        ])
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
        const preferenceInputs = wrapper
          .findAllComponents(TravelDeskFlightOptionCard)
          .map((card) => card.get("input").element)
        expect(preferenceInputs).toEqual([
          expect.objectContaining({
            value: "4",
          }),
          expect.objectContaining({
            value: "5",
          }),
          expect.objectContaining({
            value: "6",
          }),
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
        const preferenceInputs = wrapper
          .findAllComponents(TravelDeskFlightOptionCard)
          .map((card) => card.get("input").element)
        expect(preferenceInputs).toEqual([
          expect.objectContaining({
            value: "3",
          }),
          expect.objectContaining({
            value: "4",
          }),
        ])
      })

      test("when there are no options, displays the empty message", async () => {
        // Arrange
        travelDeskFlightOptionsApiMock.list.mockResolvedValue({
          travelDeskFlightOptions: [],
          totalCount: 0,
        })
        const router = mockRouter([{ path: "/", component: TravelDeskFlightOptionsDataIterator }])
        await router.push("/")
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskFlightOptionsDataIterator, {
          props: { routeQuerySuffix: "FlightOptions1" },
          global: { plugins: [vuetify, router] },
        })
        await flushPromises()

        // Assert
        const emptyMessage = wrapper.get("p")
        expect(emptyMessage.text()).toBe("No flight options available.")
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
        const preferenceInputs = wrapper
          .findAllComponents(TravelDeskFlightOptionCard)
          .map((card) => card.get("input").element)
        expect(preferenceInputs).toEqual([
          expect.objectContaining({
            value: "Does Not Work",
          }),
          expect.objectContaining({
            value: "Not Ranked",
          }),
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
        const rejectionNote = wrapper.get("textarea").element
        expect(rejectionNote.value).toBe("Arrives too late for the meeting.")
      })
    })
  })
})
