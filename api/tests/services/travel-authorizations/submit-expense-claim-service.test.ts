import { DateTime } from "luxon"

import { TravelAuthorization } from "@/models"
import SubmitExpenseClaimService from "@/services/travel-authorizations/submit-expense-claim-service"

import {
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-authorizations/submit-expense-claim-service.ts", () => {
  describe("SubmitExpenseClaimService", () => {
    describe("#perform", () => {
      beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] })
        vi.setSystemTime(new Date("2026-11-16T12:00:00Z"))
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      test("when submitting from APPROVED state, it correctly updates travel authorization state and wizard step", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create({
          email: "supervisor@example.com",
        })

        const twoDaysAgo = DateTime.now().minus({ days: 2 })
        const departureOn = twoDaysAgo.toJSDate()
        const travelSegment = travelSegmentFactory.build({
          departureOn,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [travelSegment],
          })
          .include("travelSegments")
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
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

        const twoDaysAgo = DateTime.now().minus({ days: 2 })
        const departureOn = twoDaysAgo.toJSDate()
        const travelSegment = travelSegmentFactory.build({
          departureOn,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [travelSegment],
          })
          .include("travelSegments")
          .create({
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
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

        // Act / Assert
        await expect(
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
        const twoDaysFromNow = DateTime.now().plus({ days: 2 })
        const departureOn = twoDaysFromNow.toJSDate()
        const travelSegment = travelSegmentFactory.build({
          departureOn,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [travelSegment],
          })
          .include("travelSegments")
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
          })

        // Act / Assert
        await expect(
          SubmitExpenseClaimService.perform(travelAuthorization, supervisor.email, currentUser)
        ).rejects.toThrow("Can not submit an expense claim before travel is completed.")
      })
    })
  })
})
