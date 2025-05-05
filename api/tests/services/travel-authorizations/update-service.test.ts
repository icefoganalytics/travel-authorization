import { TravelAuthorization, TravelSegment } from "@/models"
import { UpdateService } from "@/services/travel-authorizations"
import { locationFactory, stopFactory, travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/services/travel-authorizations/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test("when has 2 stops, and is a round trip, builds the correct travel segment", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create({
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
        const user = await userFactory.create()

        await UpdateService.perform(travelAuthorization, attributes, user)

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
    })
  })
})
