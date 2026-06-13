import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import SendBackToTravellerService from "@/services/travel-authorizations/send-back-to-traveller-service"

describe("api/src/services/travel-authorizations/send-back-to-traveller-service.ts", () => {
  describe("SendBackToTravellerService", () => {
    describe("#perform", () => {
      test("when sending back to traveller from EXPENSE_CLAIM_SUBMITTED state (supervisor), it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const traveller = await userFactory.create()

        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await SendBackToTravellerService.perform(
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

      test("when sending back to traveller from EXPENSE_CLAIM_APPROVED state (finance), it correctly updates travel authorization state and wizard step", async () => {
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
        const updatedTravelAuthorization = await SendBackToTravellerService.perform(
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
          SendBackToTravellerService.perform(travelAuthorization, "reason", currentUser)
        ).rejects.toThrow(
          "Travel authorization must be in expense claim submitted or approved state to send back to traveller."
        )
      })

      test("when reason is empty, it errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        })

        // Assert
        await expect(
          // Act
          SendBackToTravellerService.perform(travelAuthorization, "", currentUser)
        ).rejects.toThrow("Reason is required to send expense claim back to traveller.")
      })
    })
  })
})
