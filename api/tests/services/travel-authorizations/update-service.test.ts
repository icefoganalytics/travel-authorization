import { TravelAuthorization, TravelSegment } from "@/models"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

import UpdateService from "@/services/travel-authorizations/update-service"

describe("api/src/services/travel-authorizations/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test("when purpose details select a city before an itinerary exists, it saves the destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const location = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.DRAFT,
        })

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          { finalDestinationLocationId: location.id },
          currentUser
        )

        // Assert
        expect(result.finalDestinationLocationId).toEqual(location.id)
      })

      test("when the estimated itinerary is replaced, it preserves the saved destination independently", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const savedLocation = await locationFactory.create()
        const routeLocation = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.DRAFT,
          finalDestinationLocationId: savedLocation.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({ isActual: false })
        const segmentAttributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          segmentNumber: 1,
          arrivalLocationId: routeLocation.id,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }
        const attributes = {
          travelSegmentEstimatesAttributes: [segmentAttributes],
        }

        // Act
        const result = await UpdateService.perform(travelAuthorization, attributes, currentUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            finalDestinationLocationId: savedLocation.id,
            travelSegments: [
              expect.objectContaining({
                arrivalLocationId: routeLocation.id,
                isActual: false,
              }),
            ],
          })
        )
      })

      test("when the actual itinerary is replaced, it preserves the saved destination independently", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const savedLocation = await locationFactory.create()
        const routeLocation = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.APPROVED,
          finalDestinationLocationId: savedLocation.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({ isActual: true })
        const segmentAttributes = {
          travelAuthorizationId: travelAuthorization.id,
          isActual: true,
          segmentNumber: 1,
          arrivalLocationId: routeLocation.id,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }
        const attributes = {
          travelSegmentActualsAttributes: [segmentAttributes],
        }

        // Act
        const result = await UpdateService.perform(travelAuthorization, attributes, currentUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            finalDestinationLocationId: savedLocation.id,
            travelSegments: [
              expect.objectContaining({
                arrivalLocationId: routeLocation.id,
                isActual: true,
              }),
            ],
          })
        )
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
