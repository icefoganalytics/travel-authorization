import { DateTime } from "luxon"
import { isNil } from "lodash"

import { Expense, TravelAuthorization } from "@/models"
import SubmitExpenseClaimService from "@/services/travel-authorizations/submit-expense-claim-service"
import { UpdateService } from "@/services/travel-authorizations"

import {
  expenseFactory,
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

      test("when the traveller confirms a returned legacy multi-city destination, it resubmits the claim", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const outboundSegment = travelSegmentFactory.build({
          isActual: true,
          segmentNumber: 1,
          departureOn: "2020-01-01",
        })
        const returnSegment = travelSegmentFactory.build({
          isActual: true,
          segmentNumber: 2,
          departureOn: "2020-01-02",
        })
        const expense = expenseFactory.build({
          type: Expense.Types.EXPENSE,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [outboundSegment, returnSegment],
            expenses: [expense],
          })
          .include("travelSegments")
          .create({
            userId: currentUser.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          })
        const selectedSegment = travelAuthorization.travelSegments?.find(
          (segment) => segment.segmentNumber === 1
        )
        if (isNil(selectedSegment)) throw new Error("Outbound travel segment is missing")

        // Act
        await UpdateService.perform(
          travelAuthorization,
          { actualPrimaryDestinationId: selectedSegment.arrivalLocationId },
          currentUser
        )
        const result = await SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        expect(result.status).toEqual(TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED)
      })

      test("when a returned legacy multi-city claim is still unconfirmed, it rejects resubmission", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const travelSegments = travelSegmentFactory.buildList(2, {
          isActual: true,
          departureOn: "2020-01-01",
        })
        const expense = expenseFactory.build({
          type: Expense.Types.EXPENSE,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments,
            expenses: [expense],
          })
          .include("travelSegments")
          .create({
            userId: currentUser.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          })

        // Act
        const result = SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Select a primary destination for the multi-city itinerary before continuing."
        )
      })

      test("when only estimated multi-city selection exists, it rejects expense submission", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const estimatedSegment = travelSegmentFactory.build({
          isActual: false,
          departureOn: "2020-01-01",
        })
        const actualSegments = travelSegmentFactory.buildList(2, {
          isActual: true,
          departureOn: "2020-01-01",
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [estimatedSegment, ...actualSegments],
          })
          .include("travelSegments")
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          })

        await travelAuthorization.update({
          estimatedPrimaryDestinationId: estimatedSegment.arrivalLocationId,
        })

        // Act
        const result = SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Select a primary destination for the multi-city itinerary before continuing."
        )
      })

      test("when actual multi-city selection exists independently, it submits the expense claim", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const outboundSegment = travelSegmentFactory.build({
          isActual: true,
          segmentNumber: 1,
          departureOn: "2020-01-01",
        })
        const returnSegment = travelSegmentFactory.build({
          isActual: true,
          segmentNumber: 2,
          departureOn: "2020-01-02",
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [outboundSegment, returnSegment],
          })
          .include("travelSegments")
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          })

        await travelAuthorization.update({
          actualPrimaryDestinationId: outboundSegment.arrivalLocationId,
        })

        // Act
        const result = await SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        expect(result.status).toEqual(TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED)
      })

      test("when estimated dates are later than completed actual travel, it uses the actual phase end date", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const actualSegment = travelSegmentFactory.build({
          isActual: true,
          segmentNumber: 1,
          departureOn: "2020-01-01",
        })
        const estimatedSegment = travelSegmentFactory.build({
          isActual: false,
          segmentNumber: 99,
          departureOn: "2099-01-01",
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [actualSegment, estimatedSegment],
          })
          .include("travelSegments")
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
            tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
          })

        // Act
        const result = await SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        expect(result.status).toEqual(TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED)
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
