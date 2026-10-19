import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import SendBackToSupervisorService from "@/services/travel-authorizations/send-back-to-supervisor-service"

describe("api/src/services/travel-authorizations/send-back-to-supervisor-service.ts", () => {
  describe("SendBackToSupervisorService", () => {
    describe("#perform", () => {
      test("when finance requests supervisor corrections, it routes the traveller to supervisor approval", async () => {
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
          "Needs corrections to general ledger coding",
          financeUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
            wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL,
          })
        )
      })

      test("when the claim is not approved, it rejects the supervisor handoff", async () => {
        // Arrange
        const financeUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const supervisor = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
          supervisorEmail: supervisor.email,
        })

        // Act
        const result = SendBackToSupervisorService.perform(
          travelAuthorization,
          "Please review the coding",
          financeUser
        )

        // Assert
        await expect(result).rejects.toThrow(Error)
      })

      test("when the correction reason is empty, it rejects the supervisor handoff", async () => {
        // Arrange
        const financeUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const supervisor = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          supervisorEmail: supervisor.email,
        })

        // Act
        const result = SendBackToSupervisorService.perform(travelAuthorization, "", financeUser)

        // Assert
        await expect(result).rejects.toThrow(Error)
      })

      test("when the supervisor email is missing, it rejects the supervisor handoff", async () => {
        // Arrange
        const financeUser = await userFactory.create({
          roles: ["finance_user"],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          supervisorEmail: null,
        })

        // Act
        const result = SendBackToSupervisorService.perform(
          travelAuthorization,
          "Please review the coding",
          financeUser
        )

        // Assert
        await expect(result).rejects.toThrow(Error)
      })
    })
  })
})
