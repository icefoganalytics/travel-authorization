import { flushPromises, mount } from "@vue/test-utils"
import qs from "qs"

import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"

import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"
import { travelDeskTravelRequestAsIndexFactory } from "@/tests/factories"

import TravelDeskTravelRequestsManageDataTableServer from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsManageDataTableServer.vue"

describe("web/src/components/travel-desk-travel-requests/TravelDeskTravelRequestsManageDataTableServer.vue", () => {
  const vuetify = mockVuetify()
  const routes = [
    { path: "/", component: TravelDeskTravelRequestsManageDataTableServer },
    {
      path: "/travel-desk/:travelDeskTravelRequestId",
      name: "travel-desk/TravelDeskRequestPage",
      component: { template: "<div />" },
    },
    {
      path: "/travel-desk/:travelDeskTravelRequestId/edit",
      name: "travel-desk/TravelDeskRequestEditRedirect",
      component: { template: "<div />" },
    },
  ]

  test("when a booked request has no officer, displays its booked status", async () => {
    // Arrange
    const httpClientMock = mockHttpClient()
    httpClientMock.get.mockResolvedValue({
      data: {
        travelDeskTravelRequests: [
          travelDeskTravelRequestAsIndexFactory.build({
            status: TravelDeskTravelRequestStatuses.BOOKED,
            travelDeskOfficer: null,
            isBooked: true,
          }),
        ],
        totalCount: 1,
      },
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()

    // Assert
    const statusColumnIndex = wrapper
      .findAll("thead th")
      .findIndex((header) => header.text() === "Status")
    const status = wrapper.get(`tbody tr td:nth-child(${statusColumnIndex + 1})`).text()
    expect(status).toBe("Booked")
  })

  test("when a submitted request has no officer, displays that work has not started", async () => {
    // Arrange
    const httpClientMock = mockHttpClient()
    httpClientMock.get.mockResolvedValue({
      data: {
        travelDeskTravelRequests: [
          travelDeskTravelRequestAsIndexFactory.build({
            status: TravelDeskTravelRequestStatuses.SUBMITTED,
            travelDeskOfficer: null,
          }),
        ],
        totalCount: 1,
      },
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()

    // Assert
    const statusColumnIndex = wrapper
      .findAll("thead th")
      .findIndex((header) => header.text() === "Status")
    const status = wrapper.get(`tbody tr td:nth-child(${statusColumnIndex + 1})`).text()
    expect(status).toBe("Not Started")
  })

  test("when a submitted request has an officer, preserves its submitted status", async () => {
    // Arrange
    const httpClientMock = mockHttpClient()
    httpClientMock.get.mockResolvedValue({
      data: {
        travelDeskTravelRequests: [
          travelDeskTravelRequestAsIndexFactory.build({
            status: TravelDeskTravelRequestStatuses.SUBMITTED,
            travelDeskOfficer: "Assigned Desk Agent",
          }),
        ],
        totalCount: 1,
      },
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()

    // Assert
    const statusColumnIndex = wrapper
      .findAll("thead th")
      .findIndex((header) => header.text() === "Status")
    const status = wrapper.get(`tbody tr td:nth-child(${statusColumnIndex + 1})`).text()
    expect(status).toBe("Submitted")
  })

  test("when services come from the serialized index, displays them without nested associations", async () => {
    // Arrange
    const httpClientMock = mockHttpClient()
    httpClientMock.get.mockResolvedValue({
      data: {
        travelDeskTravelRequests: [
          travelDeskTravelRequestAsIndexFactory.build({
            requestedOptions: "flight, hotel, rental car",
          }),
        ],
        totalCount: 1,
      },
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()

    // Assert
    const requestedColumnIndex = wrapper
      .findAll("thead th")
      .findIndex((header) => header.text() === "Requested")
    const requestedServices = wrapper
      .get(`tbody tr td:nth-child(${requestedColumnIndex + 1})`)
      .text()
    expect(requestedServices).toBe("flight, hotel, rental car")
  })

  test("when a request is selected, report forms submit its ID and list order without pagination", async () => {
    // Arrange
    const httpClientMock = mockHttpClient()
    httpClientMock.get.mockResolvedValue({
      data: {
        travelDeskTravelRequests: [travelDeskTravelRequestAsIndexFactory.build({ id: 25 })],
        totalCount: 1,
      },
    })
    const router = mockRouter(routes)
    await router.push("/?page=2&perPage=5")
    await router.isReady()
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()

    // Act
    await wrapper.get('tbody input[type="checkbox"]').trigger("click")
    await flushPromises()
    const formQueries = wrapper.findAll("form").map((form) => {
      const queryInput = form.get<HTMLInputElement>('input[name="query"]')
      return qs.parse(queryInput.element.value)
    })

    // Assert
    expect(formQueries).toEqual([
      { where: { id: ["25"] }, order: [["travelStartDate", "ASC"]] },
      { where: { id: ["25"] }, order: [["travelStartDate", "ASC"]] },
    ])
  })

  test("when selection is cleared, both report forms restore all matching requests", async () => {
    // Arrange
    const httpClientMock = mockHttpClient()
    httpClientMock.get.mockResolvedValue({
      data: {
        travelDeskTravelRequests: [travelDeskTravelRequestAsIndexFactory.build({ id: 25 })],
        totalCount: 1,
      },
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router] },
    })
    await flushPromises()
    await wrapper.get('tbody input[type="checkbox"]').trigger("click")
    await flushPromises()

    // Act
    await wrapper.get('tbody input[type="checkbox"]').trigger("click")
    await flushPromises()
    const formQueries = wrapper.findAll("form").map((form) => {
      const queryInput = form.get<HTMLInputElement>('input[name="query"]')
      return qs.parse(queryInput.element.value)
    })

    // Assert
    expect(formQueries).toEqual([
      { order: [["travelStartDate", "ASC"]] },
      { order: [["travelStartDate", "ASC"]] },
    ])
  })
})
