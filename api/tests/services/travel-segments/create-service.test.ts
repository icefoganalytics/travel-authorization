import { TravelAuthorization, TravelSegment } from "@/models"
import CreateService from "@/services/travel-segments/create-service"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-segments/create-service.ts", () => {
  describe("CreateService", () => {
    describe("#perform", () => {
      test.each([
        { tripType: TravelAuthorization.TripTypes.ONE_WAY, expected: true },
        { tripType: TravelAuthorization.TripTypes.ROUND_TRIP, expected: true },
        { tripType: TravelAuthorization.TripTypes.MULTI_CITY, expected: false },
      ])(
        "when a $tripType segment omits the flag, it uses only the ordinary simple-trip default",
        async ({ tripType, expected }) => {
          // Arrange
          const currentUser = await userFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: tripType,
          })
          const arrivalLocation = await locationFactory.create()

          // Act
          const travelSegment = await CreateService.perform(
            {
              travelAuthorizationId: travelAuthorization.id,
              arrivalLocationId: arrivalLocation.id,
              segmentNumber: 1,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
            currentUser
          )

          // Assert
          expect(travelSegment.isPrimaryDestination).toEqual(expected)
        }
      )

      test("when another leg in the phase is selected, it rejects a second explicit selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true })

        // Act
        const result = CreateService.perform(
          {
            travelAuthorizationId: travelAuthorization.id,
            arrivalLocationId: selectedSegment.arrivalLocationId,
            segmentNumber: 2,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            isPrimaryDestination: true,
          },
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow()
      })

      test("when an actual leg is selected, it does not conflict with the estimated choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create()
        const selectedEstimate = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true, isActual: false })

        // Act
        const travelSegment = await CreateService.perform(
          {
            travelAuthorizationId: travelAuthorization.id,
            arrivalLocationId: selectedEstimate.arrivalLocationId,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            isActual: true,
            isPrimaryDestination: true,
          },
          currentUser
        )

        // Assert
        expect(travelSegment).toEqual(
          expect.objectContaining({ isActual: true, isPrimaryDestination: true })
        )
      })
    })
  })
})
