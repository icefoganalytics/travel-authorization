import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"
import UpdateService from "@/services/travel-authorizations/update-service"

import {
  expenseFactory,
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-authorizations/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test.each([
        ["estimated", "tripTypeEstimate", "estimatedPrimaryDestinationId", false],
        ["actual", "tripTypeActual", "actualPrimaryDestinationId", true],
      ] as const)(
        "when the %s simple trip becomes multi-city, it clears its inferred city",
        async (_phase, tripTypeAttribute, destinationAttribute, isActual) => {
          // Arrange
          const currentUser = await userFactory.create()
          const location = await locationFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            [tripTypeAttribute]: TravelAuthorization.TripTypes.ONE_WAY,
            [destinationAttribute]: location.id,
          })
          await travelSegmentFactory.associations({ travelAuthorization }).create({
            isActual,
            arrivalLocationId: location.id,
          })

          // Act
          const result = await UpdateService.perform(
            travelAuthorization,
            {
              [tripTypeAttribute]: TravelAuthorization.TripTypes.MULTI_CITY,
            },
            currentUser
          )

          // Assert
          expect(result[destinationAttribute]).toEqual(null)
        }
      )

      test("when switching to multi-city with an explicit city, it retains the matching choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const location = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          arrivalLocationId: location.id,
        })

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          {
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            estimatedPrimaryDestinationId: location.id,
          },
          currentUser
        )

        // Assert
        expect(result.estimatedPrimaryDestinationId).toEqual(location.id)
      })

      test("when a multi-city draft is unconfirmed, it saves null and every itinerary endpoint", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const location1 = await locationFactory.create()
        const location2 = await locationFactory.create()
        const travelSegmentEstimatesAttributes = [1, 2].map((segmentNumber) => ({
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          departureLocationId: segmentNumber === 1 ? location1.id : location2.id,
          arrivalLocationId: segmentNumber === 1 ? location2.id : location1.id,
          segmentNumber,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }))

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          {
            estimatedPrimaryDestinationId: null,
            travelSegmentEstimatesAttributes,
          },
          currentUser
        )

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            estimatedPrimaryDestinationId: null,
            travelSegments: travelSegmentEstimatesAttributes.map((attributes) =>
              expect.objectContaining(attributes)
            ),
          })
        )
      })

      test.each(["foreign authorization", "other phase", "departure only", "nonexistent location"])(
        "when the chosen city belongs to %s, it rejects the selection",
        async (scenario) => {
          // Arrange
          const currentUser = await userFactory.create()
          const location = await locationFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          })
          const otherAuthorization = await travelAuthorizationFactory.create()
          await travelSegmentFactory.create({
            travelAuthorizationId:
              scenario === "foreign authorization" ? otherAuthorization.id : travelAuthorization.id,
            isActual: scenario === "other phase",
            departureLocationId: scenario === "departure only" ? location.id : null,
            arrivalLocationId: scenario === "departure only" ? null : location.id,
          })

          // Act
          const result = UpdateService.perform(
            travelAuthorization,
            {
              estimatedPrimaryDestinationId: scenario === "nonexistent location" ? -1 : location.id,
            },
            currentUser
          )

          // Assert
          await expect(result).rejects.toThrow(
            "Primary destination must match an arrival in the corresponding itinerary."
          )
        }
      )

      test("when an invalid city rejects a nested update, it preserves the original itinerary", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const originalSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create()
        const location = await locationFactory.create()
        const travelSegmentEstimatesAttributes = [1, 2].map((segmentNumber) => ({
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          arrivalLocationId: originalSegment.arrivalLocationId,
          segmentNumber,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }))

        // Act
        await UpdateService.perform(
          travelAuthorization,
          {
            estimatedPrimaryDestinationId: location.id,
            travelSegmentEstimatesAttributes,
          },
          currentUser
        ).catch(() => undefined)

        // Assert
        expect(await TravelSegment.findAll()).toEqual([
          expect.objectContaining({ id: originalSegment.id }),
        ])
      })

      test.each([User.Roles.USER, User.Roles.ADMIN])(
        "when the returned claim is corrected by its owner or administrator (%s), it preserves itinerary, expenses, and estimate",
        async (role) => {
          // Arrange
          const currentUser = await userFactory.create({ roles: [role] })
          const owner = role === User.Roles.ADMIN ? await userFactory.create() : currentUser
          const estimatedCity = await locationFactory.create()
          const actualCity = await locationFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            userId: owner.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
            estimatedPrimaryDestinationId: estimatedCity.id,
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          })
          await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ isActual: true, arrivalLocationId: actualCity.id })
          await expenseFactory
            .associations({ travelAuthorization })
            .create({ type: Expense.Types.EXPENSE })
          const originalSegments = await TravelSegment.findAll()
          const originalExpenses = await Expense.findAll()
          const expectedSegments = originalSegments.map((segment) => {
            const attributes = segment.get()
            return expect.objectContaining(attributes)
          })
          const expectedExpenses = originalExpenses.map((expense) => {
            const attributes = expense.get()
            return expect.objectContaining(attributes)
          })

          // Act
          const result = await UpdateService.perform(
            travelAuthorization,
            {
              actualPrimaryDestinationId: actualCity.id,
            },
            currentUser
          )

          // Assert
          expect(result).toEqual(
            expect.objectContaining({
              estimatedPrimaryDestinationId: estimatedCity.id,
              actualPrimaryDestinationId: actualCity.id,
              travelSegments: expectedSegments,
              expenses: expectedExpenses,
            })
          )
        }
      )

      test.each(["other traveller", "estimated city", "itinerary", "expenses"])(
        "when a returned claim correction attempts %s, it denies the write",
        async (scenario) => {
          // Arrange
          const currentUser = await userFactory.create({ roles: [User.Roles.USER] })
          const owner = await userFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            userId: scenario === "other traveller" ? owner.id : currentUser.id,
            status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
          })
          const attributes =
            scenario === "estimated city"
              ? { estimatedPrimaryDestinationId: null }
              : scenario === "itinerary"
                ? { travelSegmentActualsAttributes: [] }
                : scenario === "expenses"
                  ? { expenses: [] }
                  : { actualPrimaryDestinationId: null }

          // Act
          const result = UpdateService.perform(travelAuthorization, attributes, currentUser)

          // Assert
          await expect(result).rejects.toThrow(
            "Only the owner or an administrator may correct the actual primary destination on a returned claim."
          )
        }
      )

      test("when the returned actual city is explicitly cleared, it remains unconfirmed", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const location = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          actualPrimaryDestinationId: location.id,
        })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true, arrivalLocationId: location.id })

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          { actualPrimaryDestinationId: null },
          currentUser
        )

        // Assert
        expect(result.actualPrimaryDestinationId).toEqual(null)
      })

      test("when update request includes two travel segments, and is a round trip, builds the correct travel segments", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const location1 = await locationFactory.create()
        const location2 = await locationFactory.create()
        const segment1DepartureOn = new Date("2023-11-29")
        const segment1Attributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          departureLocationId: location1.id,
          arrivalLocationId: location2.id,
          segmentNumber: 1,
          departureOn: segment1DepartureOn,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        }
        const segment2DepartureOn = new Date("2023-11-30")
        const segment2Attributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          departureLocationId: location2.id,
          arrivalLocationId: location1.id,
          segmentNumber: 2,
          departureOn: segment2DepartureOn,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        }
        const attributes = {
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          travelSegmentEstimatesAttributes: [segment1Attributes, segment2Attributes],
        }

        // Act
        await UpdateService.perform(travelAuthorization, attributes, user)

        // Assert
        expect.assertions(1)
        const savedTravelSegments = await TravelSegment.findAll({
          where: {
            travelAuthorizationId: travelAuthorization.id,
          },
        })
        const expectedTravelSegment1 = expect.objectContaining({
          departureLocationId: location1.id,
          arrivalLocationId: location2.id,
          segmentNumber: 1,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
          departureOn: "2023-11-29",
          departureTime: null,
        })
        const expectedTravelSegment2 = expect.objectContaining({
          departureLocationId: location2.id,
          arrivalLocationId: location1.id,
          segmentNumber: 2,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
          departureOn: "2023-11-30",
          departureTime: null,
        })

        expect(savedTravelSegments).toEqual([expectedTravelSegment1, expectedTravelSegment2])
      })

      test("when update request includes three travel segments, and is a round trip, it errors informatively", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const segment1Attributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          segmentNumber: 1,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        }
        const segment2Attributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          segmentNumber: 2,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        }
        const segment3Attributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          segmentNumber: 3,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        }
        const attributes = {
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          travelSegmentEstimatesAttributes: [
            segment1Attributes,
            segment2Attributes,
            segment3Attributes,
          ],
        } as Partial<TravelAuthorization>

        // Act / Assert
        await expect(
          UpdateService.perform(travelAuthorization, attributes, user)
        ).rejects.toThrowError(/Round trip must have exactly two travel segments./)
      })

      test("when travel segments are not supplied, travel authorization is updated normally", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        const attributes = {
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          travelDurationEstimate: 3,
          daysOffTravelStatusEstimate: 0,
          dateBackToWorkEstimate: "2025-05-03",
        }

        // Act
        await UpdateService.perform(travelAuthorization, attributes, user)

        // Assert
        expect.assertions(1)
        await expect(travelAuthorization.reload()).resolves.toMatchObject({
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          travelDurationEstimate: 3,
          daysOffTravelStatusEstimate: 0,
          dateBackToWorkEstimate: "2025-05-03",
        })
      })
    })
  })
})
