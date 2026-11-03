import { flushPromises, mount } from "@vue/test-utils"

import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"
import useCurrentUser from "@/use/use-current-user"

import TravelDeskRequestsDataTableServer from "@/components/travel-desk-travel-requests/TravelDeskRequestsDataTableServer.vue"

describe("web/src/components/travel-desk-travel-requests/TravelDeskRequestsDataTableServer.vue", () => {
  describe("TravelDeskRequestsDataTableServer", () => {
    test("when the request ID differs from the authorization ID, its action opens the authorization's request page", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      const travelAuthorization = {
        id: 287,
        firstName: "Taylor",
        lastName: "Traveller",
        purposeText: "Conference",
        departingAt: "2026-11-10",
        returningAt: "2026-11-12",
        locationIds: [],
        status: "approved",
        travelDeskTravelRequest: {
          id: 900,
          status: "draft",
          invoiceNumber: null,
        },
      }
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/current-user") {
          return {
            data: {
              user: {
                id: 42,
                sub: "traveller",
                email: "traveller@example.test",
                status: "active",
                firstName: "Taylor",
                lastName: "Traveller",
                roles: [],
                department: null,
                division: null,
                branch: null,
                unit: null,
                mailcode: null,
                manager: null,
                lastSyncSuccessAt: null,
                lastSyncFailureAt: null,
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
                displayName: "Taylor Traveller",
              },
              policy: {},
            },
          }
        }

        return {
          data: {
            travelAuthorizations: [travelAuthorization],
            totalCount: 16,
          },
        }
      })
      await useCurrentUser().fetch()
      const router = mockRouter([
        {
          path: "/",
          component: TravelDeskRequestsDataTableServer,
        },
        {
          path: "/travel-requests/:travelAuthorizationId/travel-desk",
          name: "travel-requests/TravelDeskRequestPage",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/")
      await router.isReady()

      // Act
      const wrapper = mount(TravelDeskRequestsDataTableServer, {
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()
      await wrapper.get("tbody tr a").trigger("click")
      await flushPromises()

      // Assert
      expect(router.currentRoute.value.fullPath).toEqual("/travel-requests/287/travel-desk")
    })
  })
})
