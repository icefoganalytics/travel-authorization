import { Expense, TravelAuthorization, TravelSegment } from "@/models"
import UpdateService from "@/services/travel-segments/update-service"

import {
  expenseFactory,
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-segments/update-service.ts", () => {
  describe("UpdateService", () => {
    describe("#perform", () => {
      test.each([
        { departureOn: "2026-11-01" },
        { departureTime: "09:30" },
        { segmentNumber: 9 },
        { accommodationType: TravelSegment.AccommodationTypes.HOTEL },
      ])("when a route detail changes (%j), it preserves the saved city", async (attributes) => {
        // Arrange
        const currentUser = await userFactory.create()
        const city = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          estimatedPrimaryDestinationId: city.id,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            arrivalLocationId: city.id,
            accommodationType: null,
            accommodationTypeOther: null,
          })

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)

        // Assert
        expect((await travelAuthorization.reload()).estimatedPrimaryDestinationId).toEqual(city.id)
      })

      test.each([false, true])(
        "when a selected arrival changes with another matching arrival present=%s, it reconciles city membership",
        async (hasDuplicate) => {
          // Arrange
          const currentUser = await userFactory.create()
          const city = await locationFactory.create()
          const replacementCity = await locationFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            estimatedPrimaryDestinationId: city.id,
          })
          const travelSegment = await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ arrivalLocationId: city.id })
          if (hasDuplicate) {
            await travelSegmentFactory
              .associations({ travelAuthorization })
              .create({ arrivalLocationId: city.id })
          }

          // Act
          await UpdateService.perform(
            travelSegment,
            { arrivalLocationId: replacementCity.id },
            currentUser
          )

          // Assert
          expect((await travelAuthorization.reload()).estimatedPrimaryDestinationId).toEqual(
            hasDuplicate ? city.id : null
          )
        }
      )

      test("when a returned claim route is edited directly, it denies the mutation", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true })

        // Act
        const result = UpdateService.perform(
          travelSegment,
          { departureOn: "2020-01-01" },
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Travel segments cannot be updated on a returned expense claim."
        )
      })

      test("when dependent expenses exist, it still rejects ordinary route updates", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create()
        await expenseFactory
          .associations({ travelAuthorization })
          .create({ type: Expense.Types.EXPENSE })

        // Act
        const result = UpdateService.perform(
          travelSegment,
          { departureOn: "2020-01-01" },
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Travel segment can no longer be updated once there are dependent expenses."
        )
      })
    })
  })
})
