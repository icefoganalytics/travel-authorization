import { flushPromises, mount } from "@vue/test-utils"

import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"
import { travelDeskTravelRequestFactory } from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

import TravelDeskTravelRequestOptionsReviewCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestOptionsReviewCard.vue"

describe("web/src/components/travel-desk-travel-requests/TravelDeskTravelRequestOptionsReviewCard.vue", () => {
  describe("TravelDeskTravelRequestOptionsReviewCard", () => {
    test("when a request has no flights or questions, its owner can submit the completed review", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      httpClient.get.mockImplementation(async (url) => {
        if (url === "/api/travel-desk-questions") {
          return { data: { travelDeskQuestions: [], totalCount: 0 } }
        }

        return { data: { travelDeskFlightRequests: [], totalCount: 0 } }
      })
      const rankedRequest = travelDeskTravelRequestFactory.build({
        id: 900,
        travelAuthorizationId: 287,
        status: TravelDeskTravelRequestStatuses.OPTIONS_RANKED,
      })
      httpClient.post.mockResolvedValue({
        data: { travelDeskTravelRequest: rankedRequest },
      })
      const router = mockRouter([{ path: "/", component: { template: "<div />" } }])
      await router.push("/")
      await router.isReady()
      const wrapper = mount(TravelDeskTravelRequestOptionsReviewCard, {
        props: {
          travelDeskTravelRequestId: 900,
          isRequestOwner: true,
          status: TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED,
        },
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      // Act
      const submitButton = wrapper
        .findAll("button")
        .find((button) => button.text() === "Submit Rankings")
      if (!submitButton) throw new Error("Missing Submit Rankings button")

      await submitButton.trigger("click")
      await flushPromises()

      // Assert
      expect(wrapper.emitted("ranked")).toEqual([[rankedRequest]])
    })

    test.each(["loading", "incomplete"])(
      "when flight requests are %s, an empty result does not enable submitting rankings",
      async (flightRequestsState) => {
        // Arrange
        const httpClient = mockHttpClient()
        httpClient.get.mockImplementation(async (url) => {
          if (url === "/api/travel-desk-questions") {
            return { data: { travelDeskQuestions: [], totalCount: 0 } }
          }
          if (flightRequestsState === "loading") return new Promise(() => {})

          return { data: { travelDeskFlightRequests: [], totalCount: 1 } }
        })
        const router = mockRouter([{ path: "/", component: { template: "<div />" } }])
        await router.push("/")
        await router.isReady()

        // Act
        const wrapper = mount(TravelDeskTravelRequestOptionsReviewCard, {
          props: {
            travelDeskTravelRequestId: 900,
            isRequestOwner: true,
            status: TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED,
          },
          global: { plugins: [mockVuetify(), router] },
        })
        await flushPromises()

        // Assert
        const submitButton = wrapper
          .findAll("button")
          .find((button) => button.text() === "Submit Rankings")
        expect(submitButton?.attributes("disabled")).toBeDefined()
      }
    )
  })
})
