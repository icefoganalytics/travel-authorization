import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import RequestExpenseClaimChangesService from "@/services/travel-authorizations/request-expense-claim-changes-service"

describe("api/src/services/travel-authorizations/request-expense-claim-changes-service.ts", () => {
  describe("RequestExpenseClaimChangesService", () => {
    describe("#perform", () => {
      test("when requesting changes from EXPENSE_CLAIM_SUBMITTED state, it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const traveller = await userFactory.create()

        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await RequestExpenseClaimChangesService.perform(
          travelAuthorization,
          "Please fix the GL coding",
          currentUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
            wizardStepName: TravelAuthorization.WizardStepNames.SUBMIT_EXPENSES,
          })
        )
      })

      test("when requesting changes from EXPENSE_CLAIM_APPROVED state (finance send-back), it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const currentUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const traveller = await userFactory.create()

        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await RequestExpenseClaimChangesService.perform(
          travelAuthorization,
          "Receipt is missing",
          currentUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
            wizardStepName: TravelAuthorization.WizardStepNames.SUBMIT_EXPENSES,
          })
        )
      })

      test("when travel authorization is not in an allowed state, it errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        // Assert
        await expect(
          // Act
          RequestExpenseClaimChangesService.perform(travelAuthorization, "reason", currentUser)
        ).rejects.toThrow(
          "Travel authorization must be in expense claim submitted or approved state to request changes."
        )
      })

      test("when request change reason is empty, it errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        })

        // Assert
        await expect(
          // Act
          RequestExpenseClaimChangesService.perform(travelAuthorization, "", currentUser)
        ).rejects.toThrow("Request change reason is required.")
      })
    })
  })
})
