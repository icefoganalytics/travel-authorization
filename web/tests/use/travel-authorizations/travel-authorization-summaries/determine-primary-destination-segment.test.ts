import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import determinePrimaryDestinationSegment from "@/use/travel-authorizations/travel-authorization-summaries/determine-primary-destination-segment"

describe("web/src/use/travel-authorizations/travel-authorization-summaries/determine-primary-destination-segment.ts", () => {
  describe("determinePrimaryDestinationSegment", () => {
    test("when a multi-city route has an earlier marked leg, returns that leg", () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: 2, isPrimaryDestination: true },
        { departureLocationId: 2, arrivalLocationId: 3, isPrimaryDestination: false },
        { departureLocationId: 3, arrivalLocationId: 1, isPrimaryDestination: false },
      ]

      // Act
      const destination = determinePrimaryDestinationSegment(
        TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments
      )

      // Assert
      expect(destination).toBe(travelSegments[0])
    })

    test("when a multi-city route is unconfirmed, does not display an inferred destination", () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: 2, isPrimaryDestination: false },
        { departureLocationId: 2, arrivalLocationId: 3, isPrimaryDestination: false },
        { departureLocationId: 3, arrivalLocationId: 1, isPrimaryDestination: false },
      ]

      // Act
      const destination = determinePrimaryDestinationSegment(
        TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments
      )

      // Assert
      expect(destination).toBeUndefined()
    })

    test.each([
      { tripType: TravelAuthorizationTripTypes.ROUND_TRIP, expectedIndex: 0 },
      { tripType: TravelAuthorizationTripTypes.ONE_WAY, expectedIndex: 1 },
    ])(
      "when an existing simple $tripType has no marker, preserves its ordinary default",
      ({ tripType, expectedIndex }) => {
        // Arrange
        const travelSegments = [
          { departureLocationId: 1, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: 1 },
        ]

        // Act
        const destination = determinePrimaryDestinationSegment(tripType, travelSegments)

        // Assert
        expect(destination).toBe(travelSegments[expectedIndex])
      }
    )

    test("when a marked arrival is missing, does not treat it as a confirmed destination", () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: null, isPrimaryDestination: true },
        { departureLocationId: 2, arrivalLocationId: 1, isPrimaryDestination: false },
      ]

      // Act
      const destination = determinePrimaryDestinationSegment(
        TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments
      )

      // Assert
      expect(destination).toBeUndefined()
    })
  })
})
