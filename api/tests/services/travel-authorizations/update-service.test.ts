import { TravelAuthorization, TravelSegment } from "@/models"
import { UpdateService } from "@/services/travel-authorizations"
import { locationFactory, travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/services/travel-authorizations/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test("when update request includes two travel segments, and is a round trip, builds the correct travel segments", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const location1 = await locationFactory.create()
        const location2 = await locationFactory.create()
        const segment1Attributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          departureLocationId: location1.id,
          arrivalLocationId: location2.id,
          segmentNumber: 1,
          departureOn: new Date("2023-11-29"),
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        }
        const segment2Attributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          departureLocationId: location2.id,
          arrivalLocationId: location1.id,
          segmentNumber: 2,
          departureOn: new Date("2023-11-30"),
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
        expect(
          await TravelSegment.findAll({
            where: {
              travelAuthorizationId: travelAuthorization.id,
            },
          })
        ).toEqual([
          expect.objectContaining({
            departureLocationId: location1.id,
            arrivalLocationId: location2.id,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: TravelSegment.AccommodationTypes.HOTEL,
            departureOn: "2023-11-29",
            departureTime: null,
          }),
          expect.objectContaining({
            departureLocationId: location2.id,
            arrivalLocationId: location1.id,
            segmentNumber: 2,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: null,
            departureOn: "2023-11-30",
            departureTime: null,
          }),
        ])
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

        // Assert
        expect.assertions(1)
        await expect(
          // Act
          UpdateService.perform(travelAuthorization, attributes, user)
        ).rejects.toThrowError(/Segment count is not valid for trip type./)
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
