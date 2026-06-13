import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import ApproveExpenseClaimService from "@/services/travel-authorizations/approve-expense-claim-service"

describe("api/src/services/travel-authorizations/approve-expense-claim-service.ts", () => {
  describe("ApproveExpenseClaimService", () => {
    describe("#perform", () => {
      test("when approving from EXPENSE_CLAIM_SUBMITTED state, it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const approver = await userFactory.create()
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await ApproveExpenseClaimService.perform(
          travelAuthorization,
          approver
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
            wizardStepName:
              TravelAuthorization.WizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING,
          })
        )
      })

      test("when re-approving from EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED state, it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const approver = await userFactory.create()
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await ApproveExpenseClaimService.perform(
          travelAuthorization,
          approver
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
            wizardStepName:
              TravelAuthorization.WizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING,
          })
        )
      })

      test("when travel authorization is not in an allowed state, it errors informatively", async () => {
        // Arrange
        const approver = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        // Assert
        await expect(
          // Act
          ApproveExpenseClaimService.perform(travelAuthorization, approver)
        ).rejects.toThrow(
          "Travel authorization must be in expense claim submitted or expense claim supervisor changes requested state to approve."
        )
      })
    })
  })
})
