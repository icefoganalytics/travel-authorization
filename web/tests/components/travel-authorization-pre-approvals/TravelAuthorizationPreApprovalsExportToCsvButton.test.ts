import { flushPromises } from "@vue/test-utils"

import { mockAuth0, mountWithDefaultPlugins } from "@/tests/support"

import TravelAuthorizationPreApprovalsExportToCsvButton from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsExportToCsvButton.vue"

describe("web/src/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsExportToCsvButton.vue", () => {
  describe("TravelAuthorizationPreApprovalsExportToCsvButton", () => {
    test("when an access token is available, submits an authenticated backend download", async () => {
      // Arrange
      const submittedForms: HTMLFormElement[] = []
      vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(function (
        this: HTMLFormElement
      ) {
        submittedForms.push(this)
      })
      const wrapper = mountWithDefaultPlugins(TravelAuthorizationPreApprovalsExportToCsvButton)

      // Act
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      expect(submittedForms).toEqual([
        expect.objectContaining({
          action: expect.stringContaining(
            "/api/downloads/travel-authorization-pre-approvals?format=csv"
          ),
          method: "post",
          elements: expect.objectContaining({
            HOISTABLE_AUTHORIZATION_TOKEN: expect.objectContaining({
              value: "test-access-token",
            }),
          }),
        }),
      ])
    })

    test("when access token acquisition is pending, does not submit an unauthenticated download", async () => {
      // Arrange
      const submittedForms: HTMLFormElement[] = []
      vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(function (
        this: HTMLFormElement
      ) {
        submittedForms.push(this)
      })
      const { promise, resolve } = Promise.withResolvers<string>()
      const auth0 = mockAuth0()
      auth0.getAccessTokenSilently.mockReturnValue(promise)
      const wrapper = mountWithDefaultPlugins(TravelAuthorizationPreApprovalsExportToCsvButton)

      // Act
      await wrapper.get("form").trigger("submit")
      await flushPromises()

      // Assert
      try {
        expect(submittedForms).toEqual([])
      } finally {
        resolve("test-access-token")
        await flushPromises()
      }
    })
  })
})
