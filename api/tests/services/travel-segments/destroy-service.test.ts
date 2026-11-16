import { TravelAuthorization } from "@/models"
import DestroyService from "@/services/travel-segments/destroy-service"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-segments/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe("#perform", () => {
      test("when deleting a leg would leave only one multi-city leg, it rejects deletion", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedTravelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: false,
          })
        await travelSegmentFactory.associations({ travelAuthorization }).create({ isActual: false })

        // Act
        const result = DestroyService.perform(selectedTravelSegment, currentUser)

        // Assert
        await expect(result).rejects.toThrow(
          "Travel segment cannot be deleted when trip type is multi-city and there are only two travel segments."
        )
      })

      test.each([false, true])(
        "when deleting a matching city with another arrival present=%s, it preserves city-level membership and the other phase",
        async (hasDuplicate) => {
          // Arrange
          const currentUser = await userFactory.create()
          const city = await locationFactory.create()
          const actualCity = await locationFactory.create()
          const otherCity = await locationFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            estimatedPrimaryDestinationId: city.id,
            actualPrimaryDestinationId: actualCity.id,
          })
          const selectedEstimate = await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ arrivalLocationId: city.id })
          await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ arrivalLocationId: hasDuplicate ? city.id : otherCity.id })
          await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ arrivalLocationId: otherCity.id })
          await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ isActual: true, arrivalLocationId: actualCity.id })

          // Act
          await DestroyService.perform(selectedEstimate, currentUser)

          // Assert
          expect(await travelAuthorization.reload()).toEqual(
            expect.objectContaining({
              estimatedPrimaryDestinationId: hasDuplicate ? city.id : null,
              actualPrimaryDestinationId: actualCity.id,
            })
          )
        }
      )
    })
  })
})
