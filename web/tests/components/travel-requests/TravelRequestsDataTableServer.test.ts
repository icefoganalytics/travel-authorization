import { flushPromises, mount } from "@vue/test-utils"

import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"
import useCurrentUser from "@/use/use-current-user"

import TravelRequestsDataTableServer from "@/components/travel-requests/TravelRequestsDataTableServer.vue"

describe("web/src/components/travel-requests/TravelRequestsDataTableServer.vue", () => {
  describe("TravelRequestsDataTableServer", () => {
    test.each([
      {
        interaction: "the request action is clicked",
        selector: "tbody tr a",
        event: "click",
        hasRequest: true,
        expectedPath: "/travel-requests/287/travel-desk",
      },
      {
        interaction: "a request row is double-clicked",
        selector: "tbody tr",
        event: "dblclick",
        hasRequest: true,
        expectedPath: "/travel-requests/287/travel-desk",
      },
      {
        interaction: "a row without a request is double-clicked",
        selector: "tbody tr",
        event: "dblclick",
        hasRequest: false,
        expectedPath: "/",
      },
    ])(
      "when $interaction, navigation respects the authorization's request",
      async ({ selector, event, hasRequest, expectedPath }) => {
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
          locations: [],
          status: "approved",
          travelDeskTravelRequest: hasRequest
            ? {
                id: 900,
                status: "draft",
                invoiceNumber: null,
              }
            : null,
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
            component: TravelRequestsDataTableServer,
          },
          {
            path: "/travel-requests/:travelAuthorizationId/travel-desk",
            name: "travel-requests/TravelRequestTravelDeskPage",
            component: {
              template: "<div />",
            },
          },
        ])
        await router.push("/")
        await router.isReady()
        const navigation = vi.spyOn(router, "push")

        // Act
        const wrapper = mount(TravelRequestsDataTableServer, {
          global: {
            plugins: [mockVuetify(), router],
          },
        })
        await flushPromises()
        await wrapper.get(selector).trigger(event, {
          button: 0,
        })
        await navigation.mock.results[0]?.value

        // Assert
        expect(router.currentRoute.value.fullPath).toEqual(expectedPath)
      }
    )

    test("when an authorization has no Travel Desk request, it does not offer a request action", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/current-user") {
          return {
            data: {
              user: {
                id: 42,
                roles: [],
              },
            },
          }
        }

        return {
          data: {
            travelAuthorizations: [
              {
                id: 287,
                firstName: "Taylor",
                lastName: "Traveller",
                purposeText: "Conference",
                departingAt: "2026-11-10",
                returningAt: "2026-11-12",
                locations: [],
                status: "draft",
                travelDeskTravelRequest: null,
              },
            ],
            totalCount: 1,
          },
        }
      })
      await useCurrentUser().fetch()
      const router = mockRouter([
        {
          path: "/",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/")
      await router.isReady()

      // Act
      const wrapper = mount(TravelRequestsDataTableServer, {
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()

      // Assert
      const requestAction = wrapper.get("tbody tr").find("a")
      expect(requestAction.exists()).toBe(false)
    })

    test.each([
      ["Travel Auth #", "id"],
      ["Traveller", "name"],
      ["Purpose", "purposeText"],
      ["Departure", "departingAt"],
      ["Return", "returningAt"],
      ["Locations", "locations"],
      ["Authorization Status", "status"],
      ["Travel Desk Status", "travelDeskStatus"],
    ])("when the user sorts by %s, it requests that order from the server", async (title, key) => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      httpClient.get.mockResolvedValueOnce({
        data: {
          user: {
            id: 42,
            roles: [],
          },
        },
      })
      await useCurrentUser().fetch()
      httpClient.get.mockResolvedValue({
        data: {
          travelAuthorizations: [],
          totalCount: 0,
        },
      })
      const router = mockRouter([
        {
          path: "/",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/?perPageTravelDesk=25")
      await router.isReady()
      const wrapper = mount(TravelRequestsDataTableServer, {
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()

      // Act
      const sortHeader = wrapper.findAll("th").find((header) => header.text() === title)
      if (!sortHeader) {
        throw new Error(`Missing ${title} header`)
      }

      await sortHeader.trigger("click")
      await flushPromises()

      // Assert
      const sortedRequest = httpClient.get.mock.lastCall
      expect(sortedRequest).toEqual([
        "/api/travel-authorizations",
        {
          params: {
            page: 1,
            perPage: 25,
            order: [[key, "ASC"]],
            where: {
              userId: 42,
            },
          },
        },
      ])
    })

    test("when the user sorts by traveller, the bookmark retains the sort and other query state", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      httpClient.get.mockResolvedValueOnce({
        data: {
          user: {
            id: 42,
            roles: [],
          },
        },
      })
      await useCurrentUser().fetch()
      httpClient.get.mockResolvedValue({
        data: {
          travelAuthorizations: [],
          totalCount: 0,
        },
      })
      const router = mockRouter([
        {
          path: "/",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/?perPageTravelDesk=25&context=travel-requests")
      await router.isReady()
      const wrapper = mount(TravelRequestsDataTableServer, {
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()
      const navigation = vi.spyOn(router, "replace")

      // Act
      await wrapper.get("th:nth-child(2)").trigger("click")
      await flushPromises()
      await navigation.mock.results[0].value

      // Assert
      const bookmarkedQuery = router.currentRoute.value.query
      expect(bookmarkedQuery).toEqual({
        perPageTravelDesk: "25",
        context: "travel-requests",
        travelDeskSortBy: ["name_asc"],
      })
    })

    test("when a bookmark sorts by traveller descending, it restores the server query", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      httpClient.get.mockResolvedValueOnce({
        data: {
          user: {
            id: 42,
            roles: [],
          },
        },
      })
      await useCurrentUser().fetch()
      httpClient.get.mockResolvedValue({
        data: {
          travelAuthorizations: [],
          totalCount: 100,
        },
      })
      const router = mockRouter([
        {
          path: "/",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push({
        path: "/",
        query: {
          pageTravelDesk: "3",
          perPageTravelDesk: "25",
          travelDeskSortBy: "name_desc",
        },
      })
      await router.isReady()

      // Act
      mount(TravelRequestsDataTableServer, {
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()

      // Assert
      const restoredRequest = httpClient.get.mock.lastCall
      expect(restoredRequest).toEqual([
        "/api/travel-authorizations",
        {
          params: {
            page: 3,
            perPage: 25,
            order: [["name", "DESC"]],
            where: {
              userId: 42,
            },
          },
        },
      ])
    })
  })
})
