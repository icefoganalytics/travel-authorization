import { flushPromises, mount } from "@vue/test-utils"

import travelDeskFlightOptionsApi from "@/api/travel-desk-flight-options-api"
import travelDeskFlightRequestsApi from "@/api/travel-desk-flight-requests-api"
import travelDeskFlightSegmentsApi from "@/api/travel-desk-flight-segments-api"

import { mockRouter, mockVuetify } from "@/tests/support"
import travelDeskFlightOptionFactory from "@/tests/factories/travel-desk-flight-option-factory"
import travelDeskFlightRequestFactory from "@/tests/factories/travel-desk-flight-request-factory"

import TravelDeskFlightRequestsManageTable from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageTable.vue"
import TravelDeskFlightOptionCard from "@/components/travel-desk-flight-options/TravelDeskFlightOptionCard.vue"

vi.mock("@/api/http-client", () => ({
  default: {},
}))
vi.mock("@/api/travel-desk-flight-options-api")
vi.mock("@/api/travel-desk-flight-requests-api")
vi.mock("@/api/travel-desk-flight-segments-api")

describe("web/src/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageTable.vue", () => {
  const vuetify = mockVuetify()
  const flightOptionsApiMock = vi.mocked(travelDeskFlightOptionsApi)
  const flightRequestsApiMock = vi.mocked(travelDeskFlightRequestsApi)
  const flightSegmentsApiMock = vi.mocked(travelDeskFlightSegmentsApi)

  test("when expanding a flight request, displays its saved numeric preference", async () => {
    // Arrange
    const flightRequest = travelDeskFlightRequestFactory.build({ id: 11 })
    flightRequestsApiMock.list.mockResolvedValue({
      travelDeskFlightRequests: [flightRequest],
      totalCount: 1,
    })
    flightOptionsApiMock.list.mockResolvedValue({
      travelDeskFlightOptions: [
        travelDeskFlightOptionFactory.build({ flightRequestId: 11, flightPreferenceOrder: 2 }),
      ],
      totalCount: 1,
    })
    flightSegmentsApiMock.list.mockResolvedValue({
      travelDeskFlightSegments: [],
      totalCount: 0,
    })
    const router = mockRouter([{ path: "/", component: TravelDeskFlightRequestsManageTable }])
    await router.push("/")
    await router.isReady()

    const wrapper = mount(TravelDeskFlightRequestsManageTable, {
      props: { showFlightOptions: true },
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()

    // Act
    await wrapper.get("button[aria-expanded='false']").trigger("click")
    await flushPromises()

    // Assert
    const preferenceInput = wrapper.getComponent(TravelDeskFlightOptionCard).get("input").element
    expect(preferenceInput.value).toBe("2")
  })

  test("when collapsing a restored expanded row, removes its options", async () => {
    // Arrange
    const flightRequest = travelDeskFlightRequestFactory.build({ id: 11 })
    flightRequestsApiMock.list.mockResolvedValue({
      travelDeskFlightRequests: [flightRequest],
      totalCount: 1,
    })
    flightOptionsApiMock.list.mockResolvedValue({
      travelDeskFlightOptions: [
        travelDeskFlightOptionFactory.build({ flightRequestId: 11, flightPreferenceOrder: 4 }),
      ],
      totalCount: 1,
    })
    flightSegmentsApiMock.list.mockResolvedValue({
      travelDeskFlightSegments: [],
      totalCount: 0,
    })
    const router = mockRouter([{ path: "/", component: TravelDeskFlightRequestsManageTable }])
    await router.push({ path: "/", query: { expandTravelDeskFlightRequest: "11" } })
    await router.isReady()

    const wrapper = mount(TravelDeskFlightRequestsManageTable, {
      props: { showFlightOptions: true },
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()

    // Act
    await wrapper.get("button[aria-expanded='true']").trigger("click")
    await flushPromises()

    // Assert
    const optionCards = wrapper.findAllComponents(TravelDeskFlightOptionCard)
    expect(optionCards).toEqual([])
  })

  test("when restoring an expanded flight request, displays its saved options page", async () => {
    // Arrange
    const whitehorseToVancouver = travelDeskFlightRequestFactory.build({ id: 11 })
    const vancouverToWhitehorse = travelDeskFlightRequestFactory.build({
      id: 12,
      departLocation: "Vancouver",
      arriveLocation: "Whitehorse",
      datePreference: "2026-11-03",
    })
    flightRequestsApiMock.list.mockResolvedValue({
      travelDeskFlightRequests: [whitehorseToVancouver, vancouverToWhitehorse],
      totalCount: 2,
    })
    const flightOptions = travelDeskFlightOptionFactory.buildList(7, { flightRequestId: 12 })
    flightOptions.forEach((option, index) => {
      option.flightPreferenceOrder = index + 1
    })
    flightOptionsApiMock.list.mockImplementation(async ({ where, page = 1, perPage = 5 } = {}) => {
      const legOptions = flightOptions.filter(
        (option) => option.flightRequestId === where?.flightRequestId
      )
      return {
        travelDeskFlightOptions: legOptions.slice((page - 1) * perPage, page * perPage),
        totalCount: legOptions.length,
      }
    })
    flightSegmentsApiMock.list.mockResolvedValue({
      travelDeskFlightSegments: [],
      totalCount: 0,
    })
    const router = mockRouter([{ path: "/", component: TravelDeskFlightRequestsManageTable }])
    await router.push({
      path: "/",
      query: { expandTravelDeskFlightRequest: "12", pageFlightOptions12: "2" },
    })
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskFlightRequestsManageTable, {
      props: { showFlightOptions: true },
      global: { plugins: [vuetify, router] },
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
    ])
  })
})
