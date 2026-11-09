import { TravelAuthorization, TravelSegment } from "@/models"
import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

import { determineFinalDestination } from "@/services/expenses/build-attributes-from-travel-segments-helpers/determine-final-destination"

describe("api/src/services/expenses/build-attributes-from-travel-segments-helpers/determine-final-destination.ts", () => {
  describe(".determineFinalDestination", () => {
    test("when trip is a round trip, final destination is departure location of last segment", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.create({
        tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
      })
      const whitehorse = await locationFactory.create({ city: "Whitehorse", province: "YT" })
      const vancouver = await locationFactory.create({ city: "Vancouver", province: "BC" })
      const travelSegment1 = await travelSegmentFactory.create({
        travelAuthorization,
        departureLocation: whitehorse,
        arrivalLocation: vancouver,
        segmentNumber: 1,
        departureOn: new Date("2022-06-05"),
        modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        accommodationType: TravelSegment.AccommodationTypes.HOTEL,
      })
      const travelSegment2 = await travelSegmentFactory.create({
        travelAuthorization,
        departureLocation: vancouver,
        arrivalLocation: whitehorse,
        segmentNumber: 2,
        departureOn: new Date("2022-06-07"),
        modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        accommodationType: null,
      })
      const travelSegments = [travelSegment1, travelSegment2]

      // Act
      const finalLocation = determineFinalDestination(travelSegments)

      // Assert
      expect(finalLocation).toEqual(
        expect.objectContaining({ id: vancouver.id, city: "Vancouver", province: "BC" })
      )
    })

    test("when trip is a one way trip, final destination is arrival location of last segment", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.create({
        tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
      })
      const whitehorse = await locationFactory.create({ city: "Whitehorse", province: "YT" })
      const vancouver = await locationFactory.create({ city: "Vancouver", province: "BC" })
      const travelSegment1 = await travelSegmentFactory.create({
        travelAuthorization,
        departureLocation: whitehorse,
        arrivalLocation: vancouver,
        segmentNumber: 1,
        departureOn: new Date("2022-06-05"),
        modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        accommodationType: TravelSegment.AccommodationTypes.HOTEL,
      })
      const travelSegments = [travelSegment1]

      // Act
      const finalLocation = determineFinalDestination(travelSegments)

      // Assert
      expect(finalLocation).toEqual(
        expect.objectContaining({ id: vancouver.id, city: "Vancouver", province: "BC" })
      )
    })

    test("when trip is a multi-destination trip, final destination is arrival location of last segment", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.create({
        tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
      })
      const whitehorse = await locationFactory.create({ city: "Whitehorse", province: "YT" })
      const vancouver = await locationFactory.create({ city: "Vancouver", province: "BC" })
      const grandePrairie = await locationFactory.create({
        city: "Grande Prairie",
        province: "AB",
      })
      const travelSegment1 = await travelSegmentFactory.create({
        travelAuthorization,
        departureLocation: whitehorse,
        arrivalLocation: vancouver,
        segmentNumber: 1,
        departureOn: new Date("2022-06-05"),
        modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        accommodationType: TravelSegment.AccommodationTypes.HOTEL,
      })
      const travelSegment2 = await travelSegmentFactory.create({
        travelAuthorization,
        departureLocation: vancouver,
        arrivalLocation: grandePrairie,
        segmentNumber: 2,
        departureOn: new Date("2022-06-07"),
        modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        accommodationType: null,
      })
      const travelSegments = [travelSegment1, travelSegment2]

      // Act
      const finalLocation = determineFinalDestination(travelSegments)

      // Assert
      expect(finalLocation).toEqual(
        expect.objectContaining({ id: grandePrairie.id, city: "Grande Prairie", province: "AB" })
      )
    })
  })
})
