import { DateTime } from "luxon"

import { TravelAuthorization } from "@/models"
import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

import SubmitExpenseClaimService from "@/services/travel-authorizations/submit-expense-claim-service"

describe("api/src/services/travel-authorizations/submit-expense-claim-service.ts", () => {
  describe("SubmitExpenseClaimService", () => {
    describe("#perform", () => {
      test("when only estimated multi-city selection exists, it rejects expense submission", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.APPROVED,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          isActual: false,
          isPrimaryDestination: true,
          departureOn: "2020-01-01",
        })
        await travelSegmentFactory.associations({ travelAuthorization }).createList(2, {
          isActual: true,
          departureOn: "2020-01-01",
        })
        await travelAuthorization.reload({ include: ["travelSegments"] })

        // Act
        const result = SubmitExpenseClaimService.perform(
          travelAuthorization,
          supervisor.email,
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Select a primary destination for the multi-city itinerary before submitting."
        )
      })

      test("when actual multi-city selection exists independently, it submits the expense claim", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.APPROVED,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          isActual: true,
          isPrimaryDestination: true,
          segmentNumber: 1,
          departureOn: "2020-01-01",
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          isActual: true,
          segmentNumber: 2,
          departureOn: "2020-01-02",
        })
        await travelAuthorization.reload({ include: ["travelSegments"] })

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
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.APPROVED,
          tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          isActual: true,
          segmentNumber: 1,
          departureOn: "2020-01-01",
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          isActual: false,
          segmentNumber: 99,
          departureOn: "2099-01-01",
        })
        await travelAuthorization.reload({ include: ["travelSegments"] })

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

        // Act / Assert
        await expect(
          SubmitExpenseClaimService.perform(travelAuthorization, supervisor.email, currentUser)
        ).rejects.toThrow("Can not submit an expense claim before travel is completed.")
      })
    })
  })
})
