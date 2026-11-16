import { TravelAuthorization, TravelSegment } from "@/models"
import UpdateService from "@/services/travel-authorizations/update-service"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-authorizations/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test("when the estimate trip becomes multi-city without segments, it clears the automatic choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: false,
            isPrimaryDestination: true,
          })

        // Act
        await UpdateService.perform(
          travelAuthorization,
          { tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY },
          currentUser
        )
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(false)
      })

      test("when the actual trip becomes multi-city without segments, it clears the automatic choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            isPrimaryDestination: true,
          })

        // Act
        await UpdateService.perform(
          travelAuthorization,
          { tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY },
          currentUser
        )
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(false)
      })

      test("when changing to multi-city with an explicit arrival choice, it retains the submitted choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: false,
            isPrimaryDestination: true,
          })
        const location = await locationFactory.create()
        const travelSegmentEstimatesAttributes = [
          {
            id: travelSegment.id,
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            isPrimaryDestination: true,
            arrivalLocationId: travelSegment.arrivalLocationId,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
          {
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            isPrimaryDestination: false,
            arrivalLocationId: location.id,
            segmentNumber: 2,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
        ]

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          {
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            travelSegmentEstimatesAttributes,
          },
          currentUser
        )
        const primaryTravelSegment = result.travelSegments?.find(
          ({ isPrimaryDestination }) => isPrimaryDestination
        )

        // Assert
        expect(primaryTravelSegment?.id).toEqual(travelSegment.id)
      })

      test("when a multi-city draft has no confirmed destination, it saves its itinerary", async () => {
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
          isPrimaryDestination: false,
          departureLocationId: segmentNumber === 1 ? location1.id : location2.id,
          arrivalLocationId: segmentNumber === 1 ? location2.id : location1.id,
          segmentNumber,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }))

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          { travelSegmentEstimatesAttributes },
          currentUser
        )

        // Assert
        const savedTravelSegments = result.travelSegments
        const expectedTravelSegment1 = expect.objectContaining({
          segmentNumber: 1,
          isPrimaryDestination: false,
        })
        const expectedTravelSegment2 = expect.objectContaining({
          segmentNumber: 2,
          isPrimaryDestination: false,
        })

        expect(savedTravelSegments).toEqual([
          expectedTravelSegment1,
          expectedTravelSegment2,
        ])
      })

      test("when posted flags choose an earlier arrival, it preserves that choice and every endpoint", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const location1 = await locationFactory.create()
        const location2 = await locationFactory.create()
        const location3 = await locationFactory.create()
        const travelSegmentEstimatesAttributes = [
          {
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            isPrimaryDestination: true,
            departureLocationId: location1.id,
            arrivalLocationId: location2.id,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
          {
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            isPrimaryDestination: false,
            departureLocationId: location2.id,
            arrivalLocationId: location3.id,
            segmentNumber: 2,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
        ]

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          { travelSegmentEstimatesAttributes },
          currentUser
        )

        // Assert
        const savedTravelSegments = result.travelSegments
        const expectedTravelSegment1 = expect.objectContaining({
          segmentNumber: 1,
          departureLocationId: location1.id,
          arrivalLocationId: location2.id,
          isPrimaryDestination: true,
        })
        const expectedTravelSegment2 = expect.objectContaining({
          segmentNumber: 2,
          departureLocationId: location2.id,
          arrivalLocationId: location3.id,
          isPrimaryDestination: false,
        })

        expect(savedTravelSegments).toEqual([
          expectedTravelSegment1,
          expectedTravelSegment2,
        ])
      })

      test("when duplicate selection rejects a nested update, it preserves the original itinerary", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const originalSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true })
        const travelSegmentEstimatesAttributes = [1, 2].map((segmentNumber) => ({
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          isPrimaryDestination: true,
          arrivalLocationId: originalSegment.arrivalLocationId,
          segmentNumber,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }))

        // Act
        await UpdateService.perform(
          travelAuthorization,
          { travelSegmentEstimatesAttributes },
          currentUser
        ).catch(() => undefined)

        // Assert
        const savedTravelSegments = await TravelSegment.findAll()
        const expectedTravelSegment1 = expect.objectContaining({
          id: originalSegment.id,
          isPrimaryDestination: true,
        })

        expect(savedTravelSegments).toEqual([
          expectedTravelSegment1,
        ])
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

        expect(savedTravelSegments).toEqual([
          expectedTravelSegment1,
          expectedTravelSegment2,
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
