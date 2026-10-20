import { flushPromises, mount } from "@vue/test-utils"
import { VTextField } from "vuetify/components"

import travelDeskFlightOptionsApi from "@/api/travel-desk-flight-options-api"
import travelDeskFlightRequestsApi from "@/api/travel-desk-flight-requests-api"
import travelDeskFlightSegmentsApi from "@/api/travel-desk-flight-segments-api"

import { mockRouter, mockVuetify } from "@/tests/support"
import travelDeskFlightOptionFactory from "@/tests/factories/travel-desk-flight-option-factory"

import TravelDeskFlightRequestsManageTable from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageTable.vue"

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
    const flightRequest = {
      id: 11,
      travelRequestId: 1,
      departLocation: "Whitehorse",
      arriveLocation: "Vancouver",
      datePreference: "2026-11-01",
      timePreference: "Anytime",
      seatPreference: "Any",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    }
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
    const preferenceField = wrapper
      .findAllComponents(VTextField)
      .find((field) => field.props("label") === "Preference")
    expect(preferenceField?.get("input").element.value).toBe("2")
  })

  test("when collapsing a restored expanded row, removes its options", async () => {
    // Arrange
    const flightRequest = {
      id: 11,
      travelRequestId: 1,
      departLocation: "Whitehorse",
      arriveLocation: "Vancouver",
      datePreference: "2026-11-01",
      timePreference: "Anytime",
      seatPreference: "Any",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    }
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
    expect(
      wrapper.findAllComponents(VTextField).some((field) => field.props("label") === "Preference")
    ).toBe(false)
  })

  test("when restoring an expanded flight request, displays its saved options page", async () => {
    // Arrange
    const whitehorseToVancouver = {
      id: 11,
      travelRequestId: 1,
      departLocation: "Whitehorse",
      arriveLocation: "Vancouver",
      datePreference: "2026-11-01",
      timePreference: "Anytime",
      seatPreference: "Any",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    }
    const vancouverToWhitehorse = {
      id: 12,
      travelRequestId: 1,
      departLocation: "Vancouver",
      arriveLocation: "Whitehorse",
      datePreference: "2026-11-03",
      timePreference: "Anytime",
      seatPreference: "Any",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    }
    flightRequestsApiMock.list.mockResolvedValue({
      travelDeskFlightRequests: [whitehorseToVancouver, vancouverToWhitehorse],
      totalCount: 2,
    })
    const flightOptions = travelDeskFlightOptionFactory.buildList(7, { flightRequestId: 12 })
    flightOptions.forEach((option, index) => {
      option.flightPreferenceOrder = index + 1
    })
    flightOptionsApiMock.list.mockImplementation(async ({ page = 1, perPage = 5 } = {}) => ({
      travelDeskFlightOptions: flightOptions.slice((page - 1) * perPage, page * perPage),
      totalCount: flightOptions.length,
    }))
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
    const rows = wrapper.findAll("tbody tr.v-data-table__tr")
    const restoredRow = rows[1]
    expect(restoredRow.get("td").text()).toBe("Vancouver")
    const preferenceField = wrapper
      .findAllComponents(VTextField)
      .find((field) => field.props("label") === "Preference")
    expect(preferenceField?.get("input").element.value).toBe("6")
  })
})
