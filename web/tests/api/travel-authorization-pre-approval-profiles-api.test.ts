import { mockHttpClient } from "@/tests/support"

import travelAuthorizationPreApprovalProfilesApi from "@/api/travel-authorization-pre-approval-profiles-api"

describe("web/src/api/travel-authorization-pre-approval-profiles-api.ts", () => {
  describe("create", () => {
    test("when adding a traveler, it posts the profile fields under the selected pre-approval", async () => {
      // Arrange
      const httpClient = mockHttpClient()

      // Act
      await travelAuthorizationPreApprovalProfilesApi.create("42", {
        profileName: "Sam Smith",
        branch: "Finance",
      })

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        "/api/travel-authorization-pre-approvals/42/profiles",
        {
          profileName: "Sam Smith",
          branch: "Finance",
        }
      )
    })
  })

  describe("update", () => {
    test("when the profile does not belong to the selected pre-approval, it propagates the rejection", async () => {
      // Arrange
      const httpClient = mockHttpClient()
      const error = new Error("Travel Authorization Pre-Approval Profile not found")
      httpClient.patch.mockImplementation(async (url) => {
        if (url === "/api/travel-authorization-pre-approvals/42/profiles/17") {
          throw error
        }

        return { data: {} }
      })

      // Act
      const update = travelAuthorizationPreApprovalProfilesApi.update(42, 17, {
        branch: "Finance",
      })

      // Assert
      await expect(update).rejects.toBe(error)
    })
  })

  describe("delete", () => {
    test("when removing a traveler, it deletes the profile under its pre-approval", async () => {
      // Arrange
      const httpClient = mockHttpClient()

      // Act
      await travelAuthorizationPreApprovalProfilesApi.delete("42", 17)

      // Assert
      expect(httpClient.delete).toHaveBeenCalledWith(
        "/api/travel-authorization-pre-approvals/42/profiles/17"
      )
    })
  })
})
