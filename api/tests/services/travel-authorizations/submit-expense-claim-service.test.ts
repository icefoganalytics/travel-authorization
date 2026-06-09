import { DateTime } from "luxon"

import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

import SubmitExpenseClaimService from "@/services/travel-authorizations/submit-expense-claim-service"

describe("api/src/services/travel-authorizations/submit-expense-claim-service.ts", () => {
  describe("SubmitExpenseClaimService", () => {
    describe("#perform", () => {
      test("when submitting from APPROVED state, it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create({
          email: "supervisor@example.com",
        })

        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const twoDaysAgo = DateTime.now().minus({ days: 2 })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureOn: twoDaysAgo.toJSDate(),
        })
        await travelAuthorization.reload({
          include: ["travelSegments"],
        })

        // Act
        const updatedTravelAuthorization = await SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
            wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL,
          })
        )
      })

      test("when re-submitting from EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED state, it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create({
          email: "supervisor@example.com",
        })

        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const twoDaysAgo = DateTime.now().minus({ days: 2 })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureOn: twoDaysAgo.toJSDate(),
        })
        await travelAuthorization.reload({
          include: ["travelSegments"],
        })

        // Act
        const updatedTravelAuthorization = await SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
            wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL,
          })
        )
      })

      test("when travel authorization is not in an allowed state, it errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create({
          email: "supervisor@example.com",
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DENIED,
        })

        // Assert
        await expect(
          // Act
          SubmitExpenseClaimService.perform(travelAuthorization, supervisor.email, currentUser)
        ).rejects.toThrow(
          "Travel authorization must be in an approved or expense claim traveller changes requested state to submit an expense claim."
        )
      })

      test("when travel authorization is not after travel end date, it errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create({
          email: "supervisor@example.com",
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const twoDaysFromNow = DateTime.now().plus({ days: 2 })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureOn: twoDaysFromNow.toJSDate(),
        })
        await travelAuthorization.reload({
          include: ["travelSegments"],
        })

        // Assert
        await expect(
          // Act
          SubmitExpenseClaimService.perform(travelAuthorization, supervisor.email, currentUser)
        ).rejects.toThrow("Can not submit an expense claim before travel is completed.")
      })
    })
  })
})
