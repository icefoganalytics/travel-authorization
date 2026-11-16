import { faker } from "@faker-js/faker"

import { TravelSegment } from "@/models"

import { stopFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

describe("api/src/models/travel-segment.ts", () => {
  describe("TravelSegment", () => {
    describe(".buildFromStops", () => {
      test("when the params are valid, builds the correct travel segment", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const departureStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          transport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
        const arrivalStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const segmentNumber = faker.number.int({
          min: 1,
          max: 10,
        })

        // Act
        const travelSegment = TravelSegment.buildFromStops({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber,
          departureStop,
          arrivalStop,
        })

        // Assert
        expect(travelSegment).toEqual(
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            departureLocationId: departureStop.locationId,
            arrivalLocationId: arrivalStop.locationId,
            segmentNumber,
            departureOn: departureStop.departureDate,
            departureTime: departureStop.departureTime,
            modeOfTransport: departureStop.transport,
            accommodationType: departureStop.accommodationType,
          })
        )
      })

      test("when the departure stop is missing a transport, throws an error", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const departureStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          transport: null,
        })
        const arrivalStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const segmentNumber = faker.number.int({
          min: 1,
          max: 10,
        })

        // Act / Assert
        expect(() =>
          TravelSegment.buildFromStops({
            travelAuthorizationId: travelAuthorization.id,
            segmentNumber,
            departureStop,
            arrivalStop,
          })
        ).toThrow(`Missing transport on Stop#${departureStop.id}`)
      })

      test("when the departure stop has a transport that is not non-standard, sets modeOfTransportOther", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const departureStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          transport: "Running",
        })
        const arrivalStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const segmentNumber = faker.number.int({
          min: 1,
          max: 10,
        })

        // Act
        const travelSegment = TravelSegment.buildFromStops({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber,
          departureStop,
          arrivalStop,
        })

        // Assert
        expect(travelSegment).toEqual(
          expect.objectContaining({
            modeOfTransport: TravelSegment.TravelMethods.OTHER,
            modeOfTransportOther: "Running",
          })
        )
      })

      test("when the departure stop has an accommodation type that is not non-standard, sets accommodationTypeOther", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const departureStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          accommodationType: "Camping",
        })
        const arrivalStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const segmentNumber = faker.number.int({
          min: 1,
          max: 10,
        })

        // Act
        const travelSegment = TravelSegment.buildFromStops({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber,
          departureStop,
          arrivalStop,
        })

        // Assert
        expect(travelSegment).toEqual(
          expect.objectContaining({
            accommodationType: TravelSegment.AccommodationTypes.OTHER,
            accommodationTypeOther: "Camping",
          })
        )
      })

      test("when accommodation type is null, sets accommodationType and accommodationTypeOther correctly", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const departureStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          accommodationType: null,
        })
        const arrivalStop = await stopFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const segmentNumber = faker.number.int({
          min: 1,
          max: 10,
        })

        // Act
        const travelSegment = TravelSegment.buildFromStops({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber,
          departureStop,
          arrivalStop,
        })

        // Assert
        expect(travelSegment).toEqual(
          expect.objectContaining({
            accommodationType: null,
            accommodationTypeOther: null,
          })
        )
      })
    })

    describe("#departureAt", () => {
      test("when the departureOn is null, departureAt is null", () => {
        // Arrange
        const travelSegment = travelSegmentFactory.build({ departureOn: null })

        // Act / Assert
        expect(travelSegment.departureAt).toBeNull()
      })

      test("when the departure time is null, time defaults to the beginning of the day", () => {
        // Arrange
        const travelSegmentDepartureOn = new Date("2021-01-01")
        const travelSegment = travelSegmentFactory.build({
          departureOn: travelSegmentDepartureOn,
          departureTime: null,
        })

        // Act / Assert
        expect(travelSegment.departureAt).toEqual(new Date("2021-01-01T00:00:00"))
      })
    })
  })

  describe("#departureAtWithTimeFallback", () => {
    test("when the departureOn is null, departureAt is null", () => {
      // Arrange
      const travelSegment = travelSegmentFactory.build({ departureOn: null })

      // Act / Assert
      expect(
        travelSegment.departureAtWithTimeFallback(TravelSegment.FallbackTimes.BEGINNING_OF_DAY)
      ).toBeNull()
    })

    test("when the departure time is null, time falls back to the beginning of the day", () => {
      // Arrange
      const travelSegmentDepartureOn = new Date("2021-01-01")
      const travelSegment = travelSegmentFactory.build({
        departureOn: travelSegmentDepartureOn,
        departureTime: null,
      })

      // Act / Assert
      expect(
        travelSegment.departureAtWithTimeFallback(TravelSegment.FallbackTimes.BEGINNING_OF_DAY)
      ).toEqual(new Date("2021-01-01T00:00:00"))
    })

    test("when the departure time is null, time falls back to the end of the day", () => {
      // Arrange
      const travelSegmentDepartureOn = new Date("2021-01-01")
      const travelSegment = travelSegmentFactory.build({
        departureOn: travelSegmentDepartureOn,
        departureTime: null,
      })

      // Act / Assert
      expect(
        travelSegment.departureAtWithTimeFallback(TravelSegment.FallbackTimes.END_OF_DAY)
      ).toEqual(new Date("2021-01-01T23:59:59"))
    })
  })
})
