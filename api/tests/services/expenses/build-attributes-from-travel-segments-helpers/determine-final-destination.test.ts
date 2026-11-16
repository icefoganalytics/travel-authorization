import { TravelAuthorization, TravelSegment } from "@/models"
import { determineFinalDestination } from "@/services/expenses/build-attributes-from-travel-segments-helpers/determine-final-destination"

import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

describe("api/src/services/expenses/build-attributes-from-travel-segments-helpers/determine-final-destination.ts", () => {
  describe(".determineFinalDestination", () => {
    test("when no travel segments exist, it rejects reimbursement destination calculation", () => {
      // Arrange
      const travelSegments: TravelSegment[] = []

      // Act & Assert
      expect(() => determineFinalDestination(travelSegments)).toThrow(
        "Missing first travel segment"
      )
    })

    test("when trip is a round trip, final destination is departure location of last segment", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.create({
        tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
      })
      const whitehorse = await locationFactory.create({
        city: "Whitehorse",
        province: "YT",
      })
      const vancouver = await locationFactory.create({
        city: "Vancouver",
        province: "BC",
      })
      const travelSegment1Factory = travelSegmentFactory
        .associations({
          travelAuthorization,
          departureLocation: whitehorse,
          arrivalLocation: vancouver,
        })
      const travelSegment1DepartureOn = new Date("2022-06-05")
      const travelSegment1 = await travelSegment1Factory
        .create({
          segmentNumber: 1,
          departureOn: travelSegment1DepartureOn,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
      const travelSegment2Factory = travelSegmentFactory
        .associations({
          travelAuthorization,
          departureLocation: vancouver,
          arrivalLocation: whitehorse,
        })
      const travelSegment2DepartureOn = new Date("2022-06-07")
      const travelSegment2 = await travelSegment2Factory
        .create({
          segmentNumber: 2,
          departureOn: travelSegment2DepartureOn,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })
      const travelSegments = [travelSegment1, travelSegment2]

      // Act
      const finalLocation = determineFinalDestination(travelSegments)

      // Assert
      expect(finalLocation).toEqual(
        expect.objectContaining({
          id: vancouver.id,
          city: "Vancouver",
          province: "BC",
        })
      )
    })

    test("when trip is a one way trip, final destination is arrival location of last segment", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.create({
        tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
      })
      const whitehorse = await locationFactory.create({
        city: "Whitehorse",
        province: "YT",
      })
      const vancouver = await locationFactory.create({
        city: "Vancouver",
        province: "BC",
      })
      const travelSegment1Factory = travelSegmentFactory
        .associations({
          travelAuthorization,
          departureLocation: whitehorse,
          arrivalLocation: vancouver,
        })
      const travelSegment1DepartureOn = new Date("2022-06-05")
      const travelSegment1 = await travelSegment1Factory
        .create({
          segmentNumber: 1,
          departureOn: travelSegment1DepartureOn,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
      const travelSegments = [travelSegment1]

      // Act
      const finalLocation = determineFinalDestination(travelSegments)

      // Assert
      expect(finalLocation).toEqual(
        expect.objectContaining({
          id: vancouver.id,
          city: "Vancouver",
          province: "BC",
        })
      )
    })

    test("when an earlier multi-city arrival is primary, the per-diem location remains the last arrival", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.create({
        tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
      })
      const whitehorse = await locationFactory.create({
        city: "Whitehorse",
        province: "YT",
      })
      const vancouver = await locationFactory.create({
        city: "Vancouver",
        province: "BC",
      })
      const grandePrairie = await locationFactory.create({
        city: "Grande Prairie",
        province: "AB",
      })
      const travelSegment1Factory = travelSegmentFactory
        .associations({
          travelAuthorization,
          departureLocation: whitehorse,
          arrivalLocation: vancouver,
        })
      const travelSegment1DepartureOn = new Date("2022-06-05")
      const travelSegment1 = await travelSegment1Factory
        .create({
          segmentNumber: 1,
          isPrimaryDestination: true,
          departureOn: travelSegment1DepartureOn,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: TravelSegment.AccommodationTypes.HOTEL,
        })
      const travelSegment2Factory = travelSegmentFactory
        .associations({
          travelAuthorization,
          departureLocation: vancouver,
          arrivalLocation: grandePrairie,
        })
      const travelSegment2DepartureOn = new Date("2022-06-07")
      const travelSegment2 = await travelSegment2Factory
        .create({
          segmentNumber: 2,
          departureOn: travelSegment2DepartureOn,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          accommodationType: null,
        })
      const travelSegments = [travelSegment1, travelSegment2]

      // Act
      const finalLocation = determineFinalDestination(travelSegments)

      // Assert
      expect(finalLocation).toEqual(
        expect.objectContaining({
          id: grandePrairie.id,
          city: "Grande Prairie",
          province: "AB",
        })
      )
    })
  })
})
