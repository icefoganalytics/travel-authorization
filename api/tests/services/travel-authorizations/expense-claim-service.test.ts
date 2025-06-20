import { DateTime } from "luxon"

import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

import ExpenseClaimService from "@/services/travel-authorizations/expense-claim-service"

describe("api/src/services/travel-authorizations/expense-claim-service.ts", () => {
  describe("ExpenseClaimService", () => {
    describe("#perform", () => {
      test("when provided with valid arguments and state, it correctly updates travel authorization state", async () => {
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
        const updatedTravelAuthorization = await ExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
          })
        )
      })

      test("when travel authorization is not in an approved state, it errors informatively", async () => {
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
          ExpenseClaimService.perform(travelAuthorization, supervisor.email, currentUser)
        ).rejects.toThrow(
          "Travel authorization must be in an approved state to submit an expense claim."
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
          ExpenseClaimService.perform(travelAuthorization, supervisor.email, currentUser)
        ).rejects.toThrow("Can not submit an expense claim before travel is completed.")
      })
    })
  })
})
