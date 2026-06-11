import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import DenyExpenseClaimService from "@/services/travel-authorizations/deny-expense-claim-service"

describe("api/src/services/travel-authorizations/deny-expense-claim-service.ts", () => {
  describe("DenyExpenseClaimService", () => {
    describe("#perform", () => {
      test("when denying from EXPENSE_CLAIM_SUBMITTED state, it sets status to EXPENSE_CLAIM_DENIED and advances the wizard to REVIEW_EXPENSES", async () => {
        // Arrange
        const denier = await userFactory.create()
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await DenyExpenseClaimService.perform(
          travelAuthorization,
          null,
          denier
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_DENIED,
            wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
          })
        )
      })

      test("when denying from EXPENSE_CLAIM_APPROVED state, it sets status to EXPENSE_CLAIM_DENIED and advances the wizard to REVIEW_EXPENSES", async () => {
        // Arrange
        const denier = await userFactory.create()
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await DenyExpenseClaimService.perform(
          travelAuthorization,
          null,
          denier
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_DENIED,
            wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
          })
        )
      })

      test("when denying from EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED state, it sets status to EXPENSE_CLAIM_DENIED and advances the wizard to REVIEW_EXPENSES", async () => {
        // Arrange
        const denier = await userFactory.create()
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await DenyExpenseClaimService.perform(
          travelAuthorization,
          null,
          denier
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_DENIED,
            wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
          })
        )
      })

      test("when travel authorization is not in an allowed state, it errors informatively", async () => {
        // Arrange
        const denier = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        // Assert
        await expect(
          // Act
          DenyExpenseClaimService.perform(travelAuthorization, null, denier)
        ).rejects.toThrow(
          "Travel authorization must be in expense claim submitted, approved, or supervisor changes requested state to deny expense claim."
        )
      })
    })
  })
})
