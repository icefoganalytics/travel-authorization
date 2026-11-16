import { TravelAuthorization, TravelSegment } from "@/models"
import CreateService from "@/services/travel-segments/create-service"

import { locationFactory, travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/services/travel-segments/create-service.ts", () => {
  describe("CreateService", () => {
    describe("#perform", () => {
      test.each([
        [TravelAuthorization.TripTypes.ONE_WAY, true],
        [TravelAuthorization.TripTypes.ROUND_TRIP, true],
        [TravelAuthorization.TripTypes.MULTI_CITY, false],
      ] as const)(
        "when creating a %s arrival, it confirms only simple-trip defaults",
        async (tripType, hasDefault) => {
          // Arrange
          const currentUser = await userFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: tripType,
          })
          const arrivalLocation = await locationFactory.create()

          // Act
          await CreateService.perform(
            {
              travelAuthorizationId: travelAuthorization.id,
              arrivalLocationId: arrivalLocation.id,
              segmentNumber: 1,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
            currentUser
          )

          // Assert
          expect((await travelAuthorization.reload()).estimatedPrimaryDestinationId).toEqual(
            hasDefault ? arrivalLocation.id : null
          )
        }
      )
    })
  })
})
