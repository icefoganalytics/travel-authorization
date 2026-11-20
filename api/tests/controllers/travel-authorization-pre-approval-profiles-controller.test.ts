import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorization-pre-approval-profiles-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalProfilesController", () => {
    describe("#destroy - DELETE - /api/travel-authorization-pre-approval-profiles/:travelAuthorizationPreApprovalProfileId", () => {
      test("when the caller's department matches the profile and its pre-approval, it deletes the profile", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Health",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Health",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({
            department: "Health",
          })

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approval-profiles/${profile.id}`
        )

        // Assert
        expect(response.status).toEqual(204)
        expect(response.body).toEqual({})
      })

      test("when the caller's department matches a legacy profile but not its pre-approval, it denies deletion", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Health",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({
            department: "Health",
          })

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approval-profiles/${profile.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to delete this travel authorization pre-approval profile.",
        })
      })
    })
  })
})
