import { flushPromises, mount } from "@vue/test-utils"

import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"
import useCurrentUser from "@/use/use-current-user"
import { travelDeskTravelRequestFactory } from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

import TravelRequestTravelDeskPage from "@/pages/travel-requests/TravelRequestTravelDeskPage.vue"

describe("web/src/pages/travel-requests/TravelRequestTravelDeskPage.vue", () => {
  describe("TravelRequestTravelDeskPage", () => {
    test("when a supervisor can update the request, they can open question creation from its details", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      const travelDeskTravelRequest = travelDeskTravelRequestFactory.build({
        id: 900,
        travelAuthorizationId: 287,
        status: TravelDeskTravelRequestStatuses.SUBMITTED,
      })
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/current-user") {
          return {
            data: {
              user: {
                id: 52,
                email: "supervisor@example.test",
                roles: [],
              },
            },
          }
        }
        if (url === "/api/travel-authorizations/287") {
          return {
            data: {
              travelAuthorization: {
                id: 287,
                userId: 42,
                supervisorEmail: "supervisor@example.test",
                travelDeskTravelRequest: {
                  id: 900,
                },
              },
            },
          }
        }
        if (url === "/api/travel-desk-travel-requests/900") {
          return {
            data: {
              travelDeskTravelRequest,
              policy: {
                update: true,
              },
            },
          }
        }

        return {
          data: {
            travelDeskQuestions: [],
            travelDeskRentalCars: [],
            travelDeskHotels: [],
            travelDeskOtherTransportations: [],
            totalCount: 0,
          },
        }
      })
      await useCurrentUser().fetch()
      const router = mockRouter([
        {
          path: "/",
          name: "travel-requests/TravelRequestsPage",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/")
      await router.isReady()
      const wrapper = mount(TravelRequestTravelDeskPage, {
        props: {
          travelAuthorizationId: "287",
        },
        attachTo: document.body,
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()

      // Act
      const addQuestionButton = wrapper
        .findAll("button")
        .find((button) => button.text() === "Add Question")
      await addQuestionButton?.trigger("click")
      await flushPromises()

      // Assert
      expect(document.body.querySelector('[role="dialog"] h2')?.textContent).toEqual("Add Question")
    })

    test("when the request is read-only, its details do not expose question management actions", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      const travelDeskTravelRequest = travelDeskTravelRequestFactory.build({
        id: 900,
        travelAuthorizationId: 287,
        status: TravelDeskTravelRequestStatuses.SUBMITTED,
      })
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/travel-authorizations/287") {
          return {
            data: {
              travelAuthorization: {
                id: 287,
                userId: 42,
                travelDeskTravelRequest: {
                  id: 900,
                },
              },
            },
          }
        }
        if (url === "/api/travel-desk-travel-requests/900") {
          return {
            data: {
              travelDeskTravelRequest,
              policy: {
                update: false,
              },
            },
          }
        }

        return {
          data: {
            travelDeskRentalCars: [],
            travelDeskHotels: [],
            travelDeskOtherTransportations: [],
            totalCount: 0,
          },
        }
      })
      const router = mockRouter([
        {
          path: "/",
          name: "travel-requests/TravelRequestsPage",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/")
      await router.isReady()

      // Act
      const wrapper = mount(TravelRequestTravelDeskPage, {
        props: {
          travelAuthorizationId: 287,
        },
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()

      // Assert
      const addQuestionButton = wrapper
        .findAll("button")
        .find((button) => button.text() === "Add Question")
      expect(addQuestionButton).toBeUndefined()
    })

    test("when the owner reviews provided options, response and ranking actions remain available", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      useCurrentUser().reset()
      const travelDeskTravelRequest = travelDeskTravelRequestFactory.build({
        id: 900,
        travelAuthorizationId: 287,
        status: TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED,
      })
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
        if (url === "/api/travel-authorizations/287") {
          return {
            data: {
              travelAuthorization: {
                id: 287,
                userId: 42,
                travelDeskTravelRequest: {
                  id: 900,
                },
              },
            },
          }
        }
        if (url === "/api/travel-desk-travel-requests/900") {
          return {
            data: {
              travelDeskTravelRequest,
              policy: {
                update: false,
              },
            },
          }
        }

        return {
          data: {
            travelDeskQuestions: [],
            travelDeskFlightRequests: [],
            travelDeskFlightOptions: [],
            travelDeskRentalCars: [],
            travelDeskHotels: [],
            travelDeskOtherTransportations: [],
            totalCount: 0,
          },
        }
      })
      await useCurrentUser().fetch()
      const router = mockRouter([
        {
          path: "/",
          name: "travel-requests/TravelRequestsPage",
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/")
      await router.isReady()

      // Act
      const wrapper = mount(TravelRequestTravelDeskPage, {
        props: {
          travelAuthorizationId: "287",
        },
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()

      // Assert
      const ownerReviewActions = wrapper
        .findAll("button")
        .map((button) => button.text())
        .filter((text) => text === "Save Responses" || text === "Submit Rankings")
      expect(ownerReviewActions).toEqual(["Save Responses", "Submit Rankings"])
    })
  })
})
