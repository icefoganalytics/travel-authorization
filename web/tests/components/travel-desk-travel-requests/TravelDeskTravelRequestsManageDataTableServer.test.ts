import { flushPromises, mount } from "@vue/test-utils"

import travelDeskTravelRequestsApi, {
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"
import vueI18nPlugin from "@/plugins/vue-i18n-plugin"

import { mockRouter, mockVuetify } from "@/tests/support"
import { travelDeskTravelRequestAsIndexFactory } from "@/tests/factories"

import TravelDeskTravelRequestsManageDataTableServer from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsManageDataTableServer.vue"

vi.mock("@/api/travel-desk-travel-requests-api")
vi.mock("@/config", () => ({
  API_BASE_URL: "http://api.example.test",
}))
vi.mock("@auth0/auth0-vue", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn(),
  }),
}))

describe("web/src/components/travel-desk-travel-requests/TravelDeskTravelRequestsManageDataTableServer.vue", () => {
  const vuetify = mockVuetify()
  const requestsApiMock = vi.mocked(travelDeskTravelRequestsApi)
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
    requestsApiMock.list.mockResolvedValue({
      travelDeskTravelRequests: [
        travelDeskTravelRequestAsIndexFactory.build({
          status: TravelDeskTravelRequestStatuses.BOOKED,
          travelDeskOfficer: null,
          isBooked: true,
        }),
      ],
      totalCount: 1,
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router, vueI18nPlugin] },
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
    requestsApiMock.list.mockResolvedValue({
      travelDeskTravelRequests: [
        travelDeskTravelRequestAsIndexFactory.build({
          status: TravelDeskTravelRequestStatuses.SUBMITTED,
          travelDeskOfficer: null,
        }),
      ],
      totalCount: 1,
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router, vueI18nPlugin] },
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
    requestsApiMock.list.mockResolvedValue({
      travelDeskTravelRequests: [
        travelDeskTravelRequestAsIndexFactory.build({
          status: TravelDeskTravelRequestStatuses.SUBMITTED,
          travelDeskOfficer: "Assigned Desk Agent",
        }),
      ],
      totalCount: 1,
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router, vueI18nPlugin] },
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
    requestsApiMock.list.mockResolvedValue({
      travelDeskTravelRequests: [
        travelDeskTravelRequestAsIndexFactory.build({
          requestedOptions: "flight, hotel, rental car",
        }),
      ],
      totalCount: 1,
    })
    const router = mockRouter(routes)
    await router.push("/")
    await router.isReady()

    // Act
    const wrapper = mount(TravelDeskTravelRequestsManageDataTableServer, {
      global: { plugins: [vuetify, router, vueI18nPlugin] },
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
})
