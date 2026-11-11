import { flushPromises, mount } from "@vue/test-utils"
import { VForm, VTextarea } from "vuetify/components"

import ApiError from "@/api/api-error"
import { TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"
import useSnack from "@/use/use-snack"

import AppSnackbar from "@/components/AppSnackbar.vue"

import { travelAuthorizationFactory } from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

import TravelAuthorizationDenyDialogButton from "@/components/travel-authorizations/manage/TravelAuthorizationDenyDialogButton.vue"

describe("web/src/components/travel-authorizations/manage/TravelAuthorizationDenyDialogButton.vue", () => {
  describe("TravelAuthorizationDenyDialogButton", () => {
    test("when the API rejects denial, displays the rejection reason to the supervisor", async () => {
      // Arrange
      const error = new ApiError("This request is no longer awaiting approval", 422)
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        status: TravelAuthorizationStatuses.SUBMITTED,
        isDraft: false,
        isSubmitted: true,
      })
      const httpClient = mockHttpClient()
      httpClient.get.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      httpClient.post.mockRejectedValue(error)
      const snack = useSnack()
      snack.reset()
      mount(AppSnackbar, {
        global: {
          plugins: [mockVuetify()],
        },
      })
      const errorHandler = vi.fn()
      const router = mockRouter([
        {
          path: "/",
          component: TravelAuthorizationDenyDialogButton,
        },
      ])
      await router.push("/")
      await router.isReady()
      const wrapper = mount(TravelAuthorizationDenyDialogButton, {
        props: {
          travelAuthorizationId: travelAuthorization.id,
        },
        global: {
          plugins: [mockVuetify(), router],
          config: { errorHandler },
        },
      })
      await flushPromises()
      await wrapper.get("button").trigger("click")
      await flushPromises()
      await wrapper
        .getComponent(VTextarea)
        .get("textarea")
        .setValue("Please revise the travel dates")

      // Act
      await wrapper.getComponent(VForm).trigger("submit")
      await flushPromises()

      // Assert
      const notification = document.querySelector(".v-snackbar.v-overlay--active [role='status']")
      expect(notification?.textContent).toContain("This request is no longer awaiting approval")
    })

    test("when the API rejects denial, handles the error without propagating it", async () => {
      // Arrange
      const error = new ApiError("This request is no longer awaiting approval", 422)
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        status: TravelAuthorizationStatuses.SUBMITTED,
        isDraft: false,
        isSubmitted: true,
      })
      const httpClient = mockHttpClient()
      httpClient.get.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      httpClient.post.mockRejectedValue(error)
      const snack = useSnack()
      snack.reset()
      const errorHandler = vi.fn()
      const router = mockRouter([
        {
          path: "/",
          component: TravelAuthorizationDenyDialogButton,
        },
      ])
      await router.push("/")
      await router.isReady()
      const wrapper = mount(TravelAuthorizationDenyDialogButton, {
        props: {
          travelAuthorizationId: travelAuthorization.id,
        },
        global: {
          plugins: [mockVuetify(), router],
          config: { errorHandler },
        },
      })
      await flushPromises()
      await wrapper.get("button").trigger("click")
      await flushPromises()
      await wrapper
        .getComponent(VTextarea)
        .get("textarea")
        .setValue("Please revise the travel dates")

      // Act
      await wrapper.getComponent(VForm).trigger("submit")
      await flushPromises()

      // Assert
      expect(errorHandler).not.toHaveBeenCalled()
    })

    test("when denial fails unexpectedly, propagates the original error to Vue", async () => {
      // Arrange
      const error = new TypeError("Unexpected approval state")
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        status: TravelAuthorizationStatuses.SUBMITTED,
        isDraft: false,
        isSubmitted: true,
      })
      const httpClient = mockHttpClient()
      httpClient.get.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      httpClient.post.mockRejectedValue(error)
      const snack = useSnack()
      snack.reset()
      const errorHandler = vi.fn()
      const router = mockRouter([
        {
          path: "/",
          component: TravelAuthorizationDenyDialogButton,
        },
      ])
      await router.push("/")
      await router.isReady()
      const wrapper = mount(TravelAuthorizationDenyDialogButton, {
        props: {
          travelAuthorizationId: travelAuthorization.id,
        },
        global: {
          plugins: [mockVuetify(), router],
          config: { errorHandler },
        },
      })
      await flushPromises()
      await wrapper.get("button").trigger("click")
      await flushPromises()
      await wrapper
        .getComponent(VTextarea)
        .get("textarea")
        .setValue("Please revise the travel dates")

      // Act
      await wrapper.getComponent(VForm).trigger("submit")
      await flushPromises()

      // Assert
      const propagatedError = errorHandler.mock.calls[0]?.[0]
      expect(propagatedError).toBe(error)
    })

    test("when denial fails unexpectedly, does not display an API error notification", async () => {
      // Arrange
      const error = new TypeError("Unexpected approval state")
      const travelAuthorization = travelAuthorizationFactory.asShow().build({
        id: 5,
        status: TravelAuthorizationStatuses.SUBMITTED,
        isDraft: false,
        isSubmitted: true,
      })
      const httpClient = mockHttpClient()
      httpClient.get.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
      httpClient.post.mockRejectedValue(error)
      const snack = useSnack()
      snack.reset()
      const errorHandler = vi.fn()
      const router = mockRouter([
        {
          path: "/",
          component: TravelAuthorizationDenyDialogButton,
        },
      ])
      await router.push("/")
      await router.isReady()
      const wrapper = mount(TravelAuthorizationDenyDialogButton, {
        props: {
          travelAuthorizationId: travelAuthorization.id,
        },
        global: {
          plugins: [mockVuetify(), router],
          config: { errorHandler },
        },
      })
      await flushPromises()
      await wrapper.get("button").trigger("click")
      await flushPromises()
      await wrapper
        .getComponent(VTextarea)
        .get("textarea")
        .setValue("Please revise the travel dates")

      // Act
      await wrapper.getComponent(VForm).trigger("submit")
      await flushPromises()

      // Assert
      expect(snack.message.value).toBe("")
    })

    test.each([
      {
        category: "API failure",
        error: new ApiError("This request is no longer awaiting approval", 422),
      },
      {
        category: "unexpected failure",
        error: new TypeError("Unexpected approval state"),
      },
    ])(
      "when denial encounters an $category, keeps the entered reason available for correction",
      async ({ error }) => {
        // Arrange
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          status: TravelAuthorizationStatuses.SUBMITTED,
          isDraft: false,
          isSubmitted: true,
        })
        const httpClient = mockHttpClient()
        httpClient.get.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
        httpClient.post.mockRejectedValue(error)
        const snack = useSnack()
        snack.reset()
        const errorHandler = vi.fn()
        const router = mockRouter([
          {
            path: "/",
            component: TravelAuthorizationDenyDialogButton,
          },
        ])
        await router.push("/")
        await router.isReady()
        const wrapper = mount(TravelAuthorizationDenyDialogButton, {
          props: {
            travelAuthorizationId: travelAuthorization.id,
          },
          global: {
            plugins: [mockVuetify(), router],
            config: { errorHandler },
          },
        })
        await flushPromises()
        await wrapper.get("button").trigger("click")
        await flushPromises()
        await wrapper
          .getComponent(VTextarea)
          .get("textarea")
          .setValue("Please revise the travel dates")

        // Act
        await wrapper.getComponent(VForm).trigger("submit")
        await flushPromises()

        // Assert
        const reasonInput = wrapper.getComponent(VTextarea).get("textarea")
        expect(reasonInput.element.value).toBe("Please revise the travel dates")
      }
    )

    test.each([
      {
        category: "API failure",
        error: new ApiError("This request is no longer awaiting approval", 422),
      },
      {
        category: "unexpected failure",
        error: new TypeError("Unexpected approval state"),
      },
    ])(
      "when denial encounters an $category, does not report a successful denial",
      async ({ error }) => {
        // Arrange
        const travelAuthorization = travelAuthorizationFactory.asShow().build({
          id: 5,
          status: TravelAuthorizationStatuses.SUBMITTED,
          isDraft: false,
          isSubmitted: true,
        })
        const httpClient = mockHttpClient()
        httpClient.get.mockResolvedValue({ data: { travelAuthorization, policy: {} } })
        httpClient.post.mockRejectedValue(error)
        const snack = useSnack()
        snack.reset()
        const errorHandler = vi.fn()
        const router = mockRouter([
          {
            path: "/",
            component: TravelAuthorizationDenyDialogButton,
          },
        ])
        await router.push("/")
        await router.isReady()
        const wrapper = mount(TravelAuthorizationDenyDialogButton, {
          props: {
            travelAuthorizationId: travelAuthorization.id,
          },
          global: {
            plugins: [mockVuetify(), router],
            config: { errorHandler },
          },
        })
        await flushPromises()
        await wrapper.get("button").trigger("click")
        await flushPromises()
        await wrapper
          .getComponent(VTextarea)
          .get("textarea")
          .setValue("Please revise the travel dates")

        // Act
        await wrapper.getComponent(VForm).trigger("submit")
        await flushPromises()

        // Assert
        expect(wrapper.emitted("denied")).toBeUndefined()
      }
    )
  })
})
