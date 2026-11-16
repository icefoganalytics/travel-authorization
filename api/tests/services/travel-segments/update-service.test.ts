import { omit } from "lodash"

import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"

import {
  expenseFactory,
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

import UpdateService from "@/services/travel-segments/update-service"

describe("api/src/services/travel-segments/update-service.ts", () => {
  describe("UpdateService", () => {
    describe("#perform", () => {
      test("when correcting a returned claim with expenses, it preserves every actual route field", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            segmentNumber: 1,
            departureOn: "2020-01-01",
          })
        await expenseFactory.associations({ travelAuthorization }).create({
          type: Expense.Types.EXPENSE,
        })
        const originalSegmentAttributes = await TravelSegment.findByPk(travelSegment.id, {
          raw: true,
          rejectOnEmpty: true,
        })
        const expectedSegmentAttributes = omit(
          originalSegmentAttributes,
          "updatedAt",
          "travelAuthorization",
          "departureLocation",
          "arrivalLocation"
        )
        expectedSegmentAttributes.isPrimaryDestination = true

        // Act
        await UpdateService.perform(travelSegment, { isPrimaryDestination: true }, currentUser)
        const savedTravelSegments = await TravelSegment.findAll({
          attributes: {
            exclude: ["updatedAt"],
          },
          raw: true,
        })
        const expectedTravelSegment = expect.objectContaining(expectedSegmentAttributes)

        // Assert
        expect(savedTravelSegments).toEqual([expectedTravelSegment])
      })

      test("when correcting a returned claim destination, it preserves all submitted expenses", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true })
        await expenseFactory.associations({ travelAuthorization }).create({
          type: Expense.Types.EXPENSE,
          cost: 123.45,
          description: "Submitted receipt",
        })
        const expectedExpenses = await Expense.findAll({ raw: true })

        // Act
        await UpdateService.perform(travelSegment, { isPrimaryDestination: true }, currentUser)
        const savedExpenses = await Expense.findAll({ raw: true })

        // Assert
        expect(savedExpenses).toEqual(expectedExpenses)
      })

      test("when changing the returned actual selection, it leaves the estimated selection intact", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const estimatedSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: false,
            isPrimaryDestination: true,
          })
        const previousActualSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            isPrimaryDestination: true,
          })
        const selectedActualSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
          })

        // Act
        await UpdateService.perform(selectedActualSegment, { isPrimaryDestination: true }, currentUser)
        const selectedSegments = await TravelSegment.findAll({
          attributes: ["id", "isPrimaryDestination"],
          order: [["id", "ASC"]],
          raw: true,
        })

        // Assert
        expect(selectedSegments).toEqual([
          {
            id: estimatedSegment.id,
            isPrimaryDestination: true,
          },
          {
            id: previousActualSegment.id,
            isPrimaryDestination: false,
          },
          {
            id: selectedActualSegment.id,
            isPrimaryDestination: true,
          },
        ])
      })

      test("when a returned claim correction includes route changes, it rejects the payload", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
          })

        // Act
        const result = UpdateService.perform(
          travelSegment,
          {
            isPrimaryDestination: true,
            departureOn: "2020-01-01",
          },
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Only the primary destination marker can be corrected on a returned claim."
        )
      })

      test("when another traveller attempts a returned claim correction, it denies the write", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
          })

        // Act
        const result = UpdateService.perform(travelSegment, { isPrimaryDestination: true }, currentUser)

        // Assert
        await expect(result).rejects.toThrow(
          "You are not authorized to correct this primary destination."
        )
      })

      test("when a returned claim correction targets an estimate, it denies the write", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: false,
          })

        // Act
        const result = UpdateService.perform(travelSegment, { isPrimaryDestination: true }, currentUser)

        // Assert
        await expect(result).rejects.toThrow(
          "You are not authorized to correct this primary destination."
        )
      })

      test("when clearing a returned actual selection, it leaves the itinerary unconfirmed", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            isPrimaryDestination: true,
          })

        // Act
        await UpdateService.perform(travelSegment, { isPrimaryDestination: false }, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(false)
      })

      test("when a stale actual segment is selected again, it restores the requested saved marker", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const originalSelectedSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            isPrimaryDestination: true,
          })
        const otherSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true })

        // Act
        await UpdateService.perform(otherSegment, { isPrimaryDestination: true }, currentUser)
        await UpdateService.perform(originalSelectedSegment, { isPrimaryDestination: true }, currentUser)
        const savedMarkers = await TravelSegment.findAll({
          attributes: ["id", "isPrimaryDestination"],
          order: [["id", "ASC"]],
          raw: true,
        })

        // Assert
        expect(savedMarkers).toEqual([
          {
            id: originalSelectedSegment.id,
            isPrimaryDestination: true,
          },
          {
            id: otherSegment.id,
            isPrimaryDestination: false,
          },
        ])
      })

      test("when a returned claim selection has no arrival, it preserves the previous marker", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const originalSelectedSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            isPrimaryDestination: true,
          })
        const incompleteSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            arrivalLocationId: null,
          })

        // Act
        await UpdateService.perform(
          incompleteSegment,
          { isPrimaryDestination: true },
          currentUser
        ).catch(() => undefined)
        await originalSelectedSegment.reload()

        // Assert
        expect(originalSelectedSegment.isPrimaryDestination).toEqual(true)
      })

      test("when departure date changes, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { departureOn: "2026-11-01" }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when departure time changes, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { departureTime: "09:30" }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when segment is reordered, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { segmentNumber: 9 }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when accommodation changes, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { accommodationType: TravelSegment.AccommodationTypes.HOTEL }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when the selected arrival changes without an explicit marker, it clears the choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: true })
        const arrivalLocation = await locationFactory.create()

        // Act
        await UpdateService.perform(
          travelSegment,
          { arrivalLocationId: arrivalLocation.id },
          currentUser
        )

        // Assert
        expect(await travelSegment.reload()).toEqual(
          expect.objectContaining({
            arrivalLocationId: arrivalLocation.id,
            isPrimaryDestination: false,
          })
        )
      })

      test("when a changed arrival is explicitly selected, it keeps the new choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: true })
        const arrivalLocation = await locationFactory.create()

        // Act
        await UpdateService.perform(
          travelSegment,
          {
            arrivalLocationId: arrivalLocation.id,
            isPrimaryDestination: true,
          },
          currentUser
        )

        // Assert
        expect(await travelSegment.reload()).toEqual(
          expect.objectContaining({
            arrivalLocationId: arrivalLocation.id,
            isPrimaryDestination: true,
          })
        )
      })

      test("when selecting a null arrival explicitly, it rejects the update", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create()

        // Act
        const result = UpdateService.perform(
          travelSegment,
          {
            arrivalLocationId: null,
            isPrimaryDestination: true,
          },
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow("Primary destination requires an arrival location.")
      })

      test("when another arrival is already selected, it preserves the persisted selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true })
        const otherSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create()

        // Act
        await UpdateService.perform(
          otherSegment,
          { isPrimaryDestination: true },
          currentUser
        ).catch(() => undefined)

        // Assert
        const savedTravelSegments = await TravelSegment.findAll({ order: [["id", "ASC"]] })
        const expectedTravelSegment1 = expect.objectContaining({
          id: selectedSegment.id,
          isPrimaryDestination: true,
        })
        const expectedTravelSegment2 = expect.objectContaining({
          id: otherSegment.id,
          isPrimaryDestination: false,
        })

        expect(savedTravelSegments).toEqual([
          expectedTravelSegment1,
          expectedTravelSegment2,
        ])
      })
    })
  })
})
