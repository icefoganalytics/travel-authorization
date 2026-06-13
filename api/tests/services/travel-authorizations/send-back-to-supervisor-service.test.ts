import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import SendBackToSupervisorService from "@/services/travel-authorizations/send-back-to-supervisor-service"

describe("api/src/services/travel-authorizations/send-back-to-supervisor-service.ts", () => {
  describe("SendBackToSupervisorService", () => {
    describe("#perform", () => {
      test("when sending back to supervisor from EXPENSE_CLAIM_APPROVED state, it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const financeUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const supervisor = await userFactory.create({
          email: "supervisor@example.com",
        })
        const traveller = await userFactory.create()

        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          supervisorEmail: supervisor.email,
          userId: traveller.id,
        })

        // Act
        const updatedTravelAuthorization = await SendBackToSupervisorService.perform(
          travelAuthorization,
          "Needs corrections to GL coding",
          financeUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
            wizardStepName:
              TravelAuthorization.WizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING,
          })
        )
      })

      test("when travel authorization is not in EXPENSE_CLAIM_APPROVED state, it errors informatively", async () => {
        // Arrange
        const financeUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        // Assert
        await expect(
          // Act
          SendBackToSupervisorService.perform(travelAuthorization, "reason", financeUser)
        ).rejects.toThrow(
          "Travel authorization must be in expense claim approved state to send back to supervisor."
        )
      })

      test("when sendback reason is empty, it errors informatively", async () => {
        // Arrange
        const financeUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
        })

        // Assert
        await expect(
          // Act
          SendBackToSupervisorService.perform(travelAuthorization, "", financeUser)
        ).rejects.toThrow("Send back reason is required to send expense claim back to supervisor.")
      })

      test("when supervisor email is missing, it errors informatively", async () => {
        // Arrange
        const financeUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          supervisorEmail: null,
        })

        // Assert
        await expect(
          // Act
          SendBackToSupervisorService.perform(travelAuthorization, "reason", financeUser)
        ).rejects.toThrow(
          "Travel authorization must have a supervisor email to send back to supervisor."
        )
      })
    })
  })
})
