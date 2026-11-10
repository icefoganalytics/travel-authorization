import { flushPromises, mount } from "@vue/test-utils"
import { VForm, VTextarea } from "vuetify/components"

import ApiError from "@/api/api-error"
import useSnack from "@/use/use-snack"

import TravelAuthorizationDenyDialogButton from "@/components/travel-authorizations/manage/TravelAuthorizationDenyDialogButton.vue"

import { travelAuthorizationAsShowFactory } from "@/tests/factories"
import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

describe("web/src/components/travel-authorizations/manage/TravelAuthorizationDenyDialogButton.vue", () => {
  describe("TravelAuthorizationDenyDialogButton", () => {
    test("when the API rejects denial, shows its reason", async () => {
      // Arrange
      const error = new ApiError("This request is no longer awaiting approval", 422)
      const travelAuthorization = travelAuthorizationAsShowFactory.submitted().build({ id: 5 })
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
      expect(snack.message.value).toContain(error.message)
    })

    test("when the API rejects denial, handles the error without propagating it", async () => {
      // Arrange
      const error = new ApiError("This request is no longer awaiting approval", 422)
      const travelAuthorization = travelAuthorizationAsShowFactory.submitted().build({ id: 5 })
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
      const travelAuthorization = travelAuthorizationAsShowFactory.submitted().build({ id: 5 })
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
      const travelAuthorization = travelAuthorizationAsShowFactory.submitted().build({ id: 5 })
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
        const travelAuthorization = travelAuthorizationAsShowFactory.submitted().build({ id: 5 })
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
        const travelAuthorization = travelAuthorizationAsShowFactory.submitted().build({ id: 5 })
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
