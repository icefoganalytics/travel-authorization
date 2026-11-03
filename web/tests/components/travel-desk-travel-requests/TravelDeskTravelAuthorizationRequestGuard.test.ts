import { flushPromises, mount } from "@vue/test-utils"

import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"
import useCurrentUser from "@/use/use-current-user"
import { travelDeskTravelRequestFactory } from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

import TravelDeskTravelAuthorizationRequestGuard from "@/components/travel-desk-travel-requests/TravelDeskTravelAuthorizationRequestGuard.vue"

describe("web/src/components/travel-desk-travel-requests/TravelDeskTravelAuthorizationRequestGuard.vue", () => {
  describe("TravelDeskTravelAuthorizationRequestGuard", () => {
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
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/")
      await router.isReady()
      const wrapper = mount(TravelDeskTravelAuthorizationRequestGuard, {
        props: {
          travelAuthorizationId: 287,
          returnTo: "/",
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
          component: {
            template: "<div />",
          },
        },
      ])
      await router.push("/")
      await router.isReady()

      // Act
      const wrapper = mount(TravelDeskTravelAuthorizationRequestGuard, {
        props: {
          travelAuthorizationId: 287,
          returnTo: "/",
        },
        global: {
          plugins: [mockVuetify(), router],
        },
      })
      await flushPromises()

      // Assert
      expect({
        notice: wrapper.get(".v-alert").text(),
        canManageQuestions: wrapper
          .findAll("button")
          .some((button) => button.text() === "Add Question"),
      }).toEqual({
        notice:
          "This request is read-only because you do not have permission to update the Travel Desk Request.",
        canManageQuestions: false,
      })
    })
  })
})
