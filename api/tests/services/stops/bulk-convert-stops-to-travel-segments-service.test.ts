import { TravelAuthorization, TravelSegment } from "@/models"
import { stopFactory, travelAuthorizationFactory } from "@/factories"
import { BulkConvertStopsToTravelSegmentsService } from "@/services/stops"

describe("api/src/services/stops/bulk-convert-stops-to-travel-segments-service.ts", () => {
  describe("BulkConvertStopsToTravelSegmentsService", () => {
    describe(".perform", () => {
      test("when has 2 stops, and is a round trip, builds the correct travel segment", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const stop1 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-11-29"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
        const stop2 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-11-30"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })

        await BulkConvertStopsToTravelSegmentsService.perform(travelAuthorization)

        expect(travelAuthorization.travelSegments).toEqual([
          expect.objectContaining({
            departureLocationId: stop1.locationId,
            arrivalLocationId: stop2.locationId,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: TravelSegment.AccommodationTypes.HOTEL,
            departureOn: stop1.departureDate,
            departureTime: stop1.departureTime,
          }),
          expect.objectContaining({
            departureLocationId: stop2.locationId,
            arrivalLocationId: stop1.locationId,
            segmentNumber: 2,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: null,
            departureOn: stop2.departureDate,
            departureTime: stop2.departureTime,
          }),
        ])
      })

      test("when has 2 stops, and is a one-way trip, builds the correct travel segment", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.ONE_WAY,
        })
        const stop1 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-11-29"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })
        const stop2 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-11-30"),
          transport: null,
          accommodationType: null,
        })

        await BulkConvertStopsToTravelSegmentsService.perform(travelAuthorization)

        expect(travelAuthorization.travelSegments).toEqual([
          expect.objectContaining({
            departureLocationId: stop1.locationId,
            arrivalLocationId: stop2.locationId,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: null,
            departureOn: stop1.departureDate,
            departureTime: stop1.departureTime,
          }),
        ])
      })

      test("when has 4 stops, and is a multi-stop trip, builds the correct travel segment", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const stop1 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-11-29"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
        const stop2 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-11-30"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
        const stop3 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-12-01"),
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })
        const stop4 = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureDate: new Date("2023-12-02"),
          transport: null,
          accommodationType: null,
        })

        await BulkConvertStopsToTravelSegmentsService.perform(travelAuthorization)

        expect(travelAuthorization.travelSegments).toEqual([
          expect.objectContaining({
            departureLocationId: stop1.locationId,
            arrivalLocationId: stop2.locationId,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: TravelSegment.AccommodationTypes.HOTEL,
            departureOn: stop1.departureDate,
            departureTime: stop1.departureTime,
          }),
          expect.objectContaining({
            departureLocationId: stop2.locationId,
            arrivalLocationId: stop3.locationId,
            segmentNumber: 2,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: TravelSegment.AccommodationTypes.HOTEL,
            departureOn: stop2.departureDate,
            departureTime: stop2.departureTime,
          }),
          expect.objectContaining({
            departureLocationId: stop3.locationId,
            arrivalLocationId: stop4.locationId,
            segmentNumber: 3,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            accommodationType: null,
            departureOn: stop3.departureDate,
            departureTime: stop3.departureTime,
          }),
        ])
      })

      test("when stops length is less than 2 for round trip type, errors informatively", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })

        expect.assertions(1)
        await expect(
          BulkConvertStopsToTravelSegmentsService.perform(travelAuthorization)
        ).rejects.toThrow("Must have at least 2 stops to build a travel segments")
      })

      test("when stops length is less than 2 for one-way trip type, errors informatively", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.ONE_WAY,
        })
        await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })

        expect.assertions(1)
        await expect(
          BulkConvertStopsToTravelSegmentsService.perform(travelAuthorization)
        ).rejects.toThrow("Must have at least 2 stops to build a travel segments")
      })

      test("when stops length is less than 3, for multi-stop trip type, errors informatively", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
        await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })

        expect.assertions(1)
        await expect(
          BulkConvertStopsToTravelSegmentsService.perform(travelAuthorization)
        ).rejects.toThrow("Must have at least 3 stops to build a multi-stop travel segments")
      })
    })
  })
})
