import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile } from "@/models"
import { CreateService } from "@/services/travel-authorization-pre-approvals/create-service"

import { userFactory } from "@/factories"

describe("api/src/services/travel-authorization-pre-approvals/create-service.ts", () => {
  describe("CreateService", () => {
    describe("#perform", () => {
      test("when a nested profile omits its department, it saves the profile in the parent department", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })

        // Act
        const preApproval = await CreateService.perform(
          {
            department: "Finance",
            estimatedCost: 1200,
            location: "Dawson",
            profilesAttributes: [
              {
                profileName: "Jane.Traveller",
              },
            ],
          },
          user
        )

        // Assert
        expect(await TravelAuthorizationPreApprovalProfile.findAll()).toEqual([
          expect.objectContaining({
            preApprovalId: preApproval.id,
            profileName: "Jane.Traveller",
            department: "Finance",
          }),
        ])
      })

      test("when a later nested profile has a conflicting department, it rolls back the pre-approval", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })

        // Act
        await CreateService.perform(
          {
            department: "Finance",
            estimatedCost: 1200,
            location: "Dawson",
            profilesAttributes: [
              {
                profileName: "Jane.Traveller",
                department: "Finance",
              },
              {
                profileName: "Alex.Traveller",
                department: "Health",
              },
            ],
          },
          user
        ).catch(() => undefined)

        // Assert
        expect(await TravelAuthorizationPreApproval.findAll()).toEqual([])
      })
    })
  })
})
