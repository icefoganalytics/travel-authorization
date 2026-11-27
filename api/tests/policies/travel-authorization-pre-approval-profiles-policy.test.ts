import { TravelAuthorizationPreApprovalProfile } from "@/models"
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

      test("when the user shares only UNKNOWN with the parent and profile, it denies all profile permissions", async () => {
        // Arrange
        const user = await userFactory.create({ department: "UNKNOWN" })
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "UNKNOWN",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .include(["preApproval"])
          .create({ department: "UNKNOWN" })
        const policy = new TravelAuthorizationPreApprovalProfilesPolicy(user, profile)

        // Act
        const permissions = policy.toJSON()

        // Assert
        expect(permissions).toEqual({
          show: false,
          create: false,
          update: false,
          destroy: false,
        })
      })

      test("when the parent association is not loaded, it denies profile mutations even to an admin", async () => {
        // Arrange
        const user = await userFactory.asAdmin().create()
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

    describe(".applyScope", () => {
      test("when a non-admin shares only UNKNOWN with a legacy profile, it excludes that profile", async () => {
        // Arrange
        const user = await userFactory.create({ department: "UNKNOWN" })
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "UNKNOWN",
        })
        await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "UNKNOWN" })

        // Act
        const scopedTravelAuthorizationPreApprovalProfiles =
          TravelAuthorizationPreApprovalProfilesPolicy.applyScope([], user)
        const profiles = await scopedTravelAuthorizationPreApprovalProfiles.findAll()

        // Assert
        expect(profiles).toEqual([])
      })

      test("when the caller is an admin, it includes a legacy profile with department UNKNOWN", async () => {
        // Arrange
        const user = await userFactory.asAdmin().create()
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "UNKNOWN",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "UNKNOWN" })

        // Act
        const scopedTravelAuthorizationPreApprovalProfiles =
          TravelAuthorizationPreApprovalProfilesPolicy.applyScope([], user)
        const profiles = await scopedTravelAuthorizationPreApprovalProfiles.findAll()

        // Assert
        expect(profiles).toEqual([
          expect.objectContaining({
            id: profile.id,
            department: "UNKNOWN",
          }),
        ])
      })
    })
  })
})
