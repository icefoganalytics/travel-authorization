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
      test("when a one-way segment omits the flag, it uses only the ordinary default", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
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
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when a round-trip segment omits the flag, it uses only the ordinary default", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
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
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when a multi-city segment omits the flag, it uses only the ordinary default", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
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
        expect(travelSegment.isPrimaryDestination).toEqual(false)
      })

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
          .create({
            isPrimaryDestination: true,
            isActual: false,
          })

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
          expect.objectContaining({
            isActual: true,
            isPrimaryDestination: true,
          })
        )
      })
    })
  })
})
