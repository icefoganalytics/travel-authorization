import { TravelAuthorizationPreApprovalProfile, User } from "@/models"
import TravelAuthorizationPreApprovalProfilesPolicy from "@/policies/travel-authorization-pre-approval-profiles-policy"

import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"

describe("api/src/policies/travel-authorization-pre-approval-profiles-policy.ts", () => {
  describe("TravelAuthorizationPreApprovalProfilesPolicy", () => {
    describe("#toJSON", () => {
      test("when the user shares the parent and profile department, it allows profile mutations", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .include(["preApproval"])
          .create({
            department: "Finance",
          })
        const policy = new TravelAuthorizationPreApprovalProfilesPolicy(user, profile)

        // Act
        const permissions = policy.toJSON()

        // Assert
        expect(permissions).toEqual({
          show: true,
          create: true,
          update: true,
          destroy: true,
        })
      })

      test("when the parent association is not loaded, it denies profile mutations even to an admin", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory.create()
        const profileWithoutPreApproval = await TravelAuthorizationPreApprovalProfile.findByPk(
          profile.id,
          {
            rejectOnEmpty: true,
          }
        )
        const policy = new TravelAuthorizationPreApprovalProfilesPolicy(
          user,
          profileWithoutPreApproval
        )

        // Act
        const permissions = policy.toJSON()

        // Assert
        expect(permissions).toEqual({
          show: true,
          create: false,
          update: false,
          destroy: false,
        })
      })
    })
  })
})
