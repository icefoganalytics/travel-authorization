import { TravelAuthorization } from "@/models"
import ExpenseService from "@/services/travel-authorizations/expense-service"

import { travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/services/travel-authorizations/expense-service.ts", () => {
  describe("ExpenseService", () => {
    describe(".perform", () => {
      test("when processing payment from EXPENSE_CLAIM_APPROVED state, it sets status to EXPENSED and advances the wizard to REVIEW_EXPENSES", async () => {
        // Arrange
        const financeUser = await userFactory.create()
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await ExpenseService.perform(
          travelAuthorization,
          financeUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSED,
            wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
          })
        )
      })

      test("when travel authorization is not in an allowed state, it errors informatively", async () => {
        // Arrange
        const financeUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        // Assert
        await expect(
          // Act
          ExpenseService.perform(travelAuthorization, financeUser)
        ).rejects.toThrow(
          "Travel authorization must be in expense claim approved state to complete."
        )
      })
    })
  })
})
