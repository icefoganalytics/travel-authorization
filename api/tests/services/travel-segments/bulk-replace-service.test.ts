import { TravelAuthorization, TravelSegment } from "@/models"
import { BulkReplaceService } from "@/services/travel-segments/bulk-replace-service"

import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

describe("api/src/services/travel-segments/bulk-replace-service.ts", () => {
  describe("BulkReplaceService", () => {
    describe("#perform", () => {
      test.each([
        [TravelAuthorization.TripTypes.ROUND_TRIP, 1],
        [TravelAuthorization.TripTypes.ONE_WAY, 3],
        [TravelAuthorization.TripTypes.MULTI_CITY, null],
      ] as const)(
        "when replacing a %s itinerary, it uses only its ordinary default (%s)",
        async (tripType, expectedSegmentNumber) => {
          // Arrange
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: tripType,
          })
          const location1 = await locationFactory.create()
          const location2 = await locationFactory.create()
          const location3 = await locationFactory.create()
          const attributes = [
            {
              travelAuthorizationId: travelAuthorization.id,
              isActual: false,
              segmentNumber: 3,
              arrivalLocationId: location3.id,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
            {
              travelAuthorizationId: travelAuthorization.id,
              isActual: false,
              segmentNumber: 1,
              arrivalLocationId: location1.id,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
            {
              travelAuthorizationId: travelAuthorization.id,
              isActual: false,
              segmentNumber: 2,
              arrivalLocationId: location2.id,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
          ]
          const expectedCityId =
            expectedSegmentNumber === 1
              ? location1.id
              : expectedSegmentNumber === 3
                ? location3.id
                : null

          // Act
          await BulkReplaceService.perform(travelAuthorization.id, attributes, false)

          // Assert
          expect((await travelAuthorization.reload()).estimatedPrimaryDestinationId).toEqual(
            expectedCityId
          )
        }
      )

      test("when replacing and reordering a duplicate arrival, it preserves the city without relying on a segment identity", async () => {
        // Arrange
        const city = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          estimatedPrimaryDestinationId: city.id,
        })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .createList(2, { arrivalLocationId: city.id })
        const attributes = [
          {
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            segmentNumber: 9,
            arrivalLocationId: city.id,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
        ]

        // Act
        await BulkReplaceService.perform(travelAuthorization.id, attributes, false)

        // Assert
        expect((await travelAuthorization.reload()).estimatedPrimaryDestinationId).toEqual(city.id)
      })

      test.each([false, true])(
        "when the last matching city is replaced in phase %s, it clears only that phase",
        async (isActual) => {
          // Arrange
          const estimatedCity = await locationFactory.create()
          const actualCity = await locationFactory.create()
          const otherCity = await locationFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            estimatedPrimaryDestinationId: estimatedCity.id,
            actualPrimaryDestinationId: actualCity.id,
          })
          await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ isActual: false, arrivalLocationId: estimatedCity.id })
          await travelSegmentFactory
            .associations({ travelAuthorization })
            .create({ isActual: true, arrivalLocationId: actualCity.id })
          const attributes = [
            {
              travelAuthorizationId: travelAuthorization.id,
              isActual,
              segmentNumber: 1,
              arrivalLocationId: otherCity.id,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
          ]

          // Act
          await BulkReplaceService.perform(travelAuthorization.id, attributes, isActual)

          // Assert
          expect(await travelAuthorization.reload()).toEqual(
            expect.objectContaining({
              estimatedPrimaryDestinationId: isActual ? estimatedCity.id : null,
              actualPrimaryDestinationId: isActual ? null : actualCity.id,
            })
          )
        }
      )
    })
  })
})
