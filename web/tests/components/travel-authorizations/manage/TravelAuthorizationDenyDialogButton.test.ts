import { ref } from "vue"
import { flushPromises, mount } from "@vue/test-utils"
import { VForm, VTextarea } from "vuetify/components"

import ApiError from "@/api/api-error"
import TravelAuthorizationDenyDialogButton from "@/components/travel-authorizations/manage/TravelAuthorizationDenyDialogButton.vue"
import { mockRouter, mockVuetify } from "@/tests/support"
import useSnack from "@/use/use-snack"

const { deny } = vi.hoisted(() => ({ deny: vi.fn() }))

vi.mock("@/use/use-travel-authorization", () => ({
  useTravelAuthorization: () => ({
    deny,
    isLoading: ref(false),
  }),
}))

describe("web/src/components/travel-authorizations/manage/TravelAuthorizationDenyDialogButton.vue", () => {
  describe("TravelAuthorizationDenyDialogButton", () => {
    test.each([
      {
        category: "API failure",
        error: new ApiError("This request is no longer awaiting approval", 422),
        isHandledLocally: true,
      },
      {
        category: "unexpected failure",
        error: new TypeError("Unexpected approval state"),
        isHandledLocally: false,
      },
    ])(
      "when denial encounters an $category, preserves the form and the failure's owner",
      async ({ error, isHandledLocally }) => {
        // Arrange
        deny.mockRejectedValue(error)
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
            travelAuthorizationId: 5,
          },
          global: {
            plugins: [mockVuetify(), router],
            config: { errorHandler },
          },
        })
        await wrapper.get("button").trigger("click")
        await flushPromises()
        const reasonInput = wrapper.getComponent(VTextarea).get("textarea")
        await reasonInput.setValue("Please revise the travel dates")

        // Act
        await wrapper.getComponent(VForm).trigger("submit")
        await flushPromises()

        // Assert
        expect({
          reason: reasonInput.element.value,
          denied: wrapper.emitted("denied"),
          apiReasonVisible: snack.message.value.includes(error.message),
          notificationColor: snack.options.value.color,
          propagatedOriginal: errorHandler.mock.calls[0]?.[0] === error,
        }).toEqual({
          reason: "Please revise the travel dates",
          denied: undefined,
          apiReasonVisible: isHandledLocally,
          notificationColor: isHandledLocally ? "error" : undefined,
          propagatedOriginal: !isHandledLocally,
        })
      }
    )
  })
})
