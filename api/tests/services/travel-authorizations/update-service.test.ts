import { TravelAuthorization, TravelSegment } from "@/models"
import { UpdateService } from "@/services/travel-authorizations"
import { locationFactory, stopFactory, travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/services/travel-authorizations/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test("when update request includes two stops, and is a round trip, builds the correct travel segment", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const location1 = await locationFactory.create()
        const stop1 = stopFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          locationId: location1.id,
          departureDate: new Date("2023-11-29"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
        const location2 = await locationFactory.create()
        const stop2 = stopFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          locationId: location2.id,
          departureDate: new Date("2023-11-30"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })
        const attributes = {
          stops: [stop1.dataValues, stop2.dataValues],
        } as Partial<TravelAuthorization>

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
            departureOn: stop1.departureDate,
            departureTime: stop1.departureTime,
          }),
          expect.objectContaining({
            departureLocationId: location2.id,
            arrivalLocationId: location1.id,
            segmentNumber: 2,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: null,
            departureOn: stop2.departureDate,
            departureTime: stop2.departureTime,
          }),
        ])
      })

      test("when update request includes three stops, and is a round trip, it errors informatively", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const stop1 = stopFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
        const stop2 = stopFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })
        const stop3 = stopFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })
        const attributes = {
          stops: [stop1.dataValues, stop2.dataValues, stop3.dataValues],
        } as Partial<TravelAuthorization>

        // Assert
        expect.assertions(1)
        await expect(
          // Act
          UpdateService.perform(travelAuthorization, attributes, user)
        ).rejects.toThrowError(/Stop count is not valid for trip type./)
      })

      test("when stops are not supplied, travel authorization is updated normally", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        const attributes = {
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
          travelDuration: 3,
          daysOffTravelStatus: 0,
          dateBackToWork: "2025-05-03",
        }

        // Act
        await UpdateService.perform(travelAuthorization, attributes, user)

        // Assert
        expect.assertions(1)
        await expect(travelAuthorization.reload()).resolves.toMatchObject({
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
          travelDuration: 3,
          daysOffTravelStatus: 0,
          dateBackToWork: "2025-05-03",
        })
      })
    })
  })
})
