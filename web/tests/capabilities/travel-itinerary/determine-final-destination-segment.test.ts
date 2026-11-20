import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"

import determineFinalDestinationSegment from "@/capabilities/travel-itinerary/determine-final-destination-segment"

describe("web/src/capabilities/travel-itinerary/determine-final-destination-segment.ts", () => {
  describe("determineFinalDestinationSegment", () => {
    test("when a multi-city itinerary returns home, selects the destination before the return leg", () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: 2 },
        { departureLocationId: 2, arrivalLocationId: 3 },
        { departureLocationId: 3, arrivalLocationId: 1 },
      ]

      // Act
      const destination = determineFinalDestinationSegment(
        TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments
      )

      // Assert
      expect(destination?.arrivalLocationId).toBe(3)
    })

    test("when a multi-city itinerary does not return home, selects its last arrival", () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: 2 },
        { departureLocationId: 2, arrivalLocationId: 3 },
        { departureLocationId: 3, arrivalLocationId: 4 },
      ]

      // Act
      const destination = determineFinalDestinationSegment(
        TravelAuthorizationTripTypes.MULTI_CITY,
        travelSegments
      )

      // Assert
      expect(destination?.arrivalLocationId).toBe(4)
    })

    test("when a round trip returns home, keeps the outbound destination", () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: 2 },
        { departureLocationId: 2, arrivalLocationId: 1 },
      ]

      // Act
      const destination = determineFinalDestinationSegment(
        TravelAuthorizationTripTypes.ROUND_TRIP,
        travelSegments
      )

      // Assert
      expect(destination?.arrivalLocationId).toBe(2)
    })

    test("when a one-way itinerary ends at its origin, still selects its last arrival", () => {
      // Arrange
      const travelSegments = [
        { departureLocationId: 1, arrivalLocationId: 2 },
        { departureLocationId: 2, arrivalLocationId: 1 },
      ]

      // Act
      const destination = determineFinalDestinationSegment(
        TravelAuthorizationTripTypes.ONE_WAY,
        travelSegments
      )

      // Assert
      expect(destination?.arrivalLocationId).toBe(1)
    })

    test.each([null, undefined])(
      "when origin and last arrival are both %s, does not mistake missing locations for a return home",
      (missingLocationId) => {
        // Arrange
        const travelSegments = [
          { departureLocationId: missingLocationId, arrivalLocationId: 2 },
          { departureLocationId: 2, arrivalLocationId: missingLocationId },
        ]

        // Act
        const destination = determineFinalDestinationSegment(
          TravelAuthorizationTripTypes.MULTI_CITY,
          travelSegments
        )

        // Assert
        expect(destination).toBe(travelSegments.at(-1))
      }
    )

    test.each([null, undefined, []])(
      "when segments are %s, has no destination",
      (travelSegments) => {
        // Arrange
        const tripType = TravelAuthorizationTripTypes.MULTI_CITY

        // Act
        const destination = determineFinalDestinationSegment(tripType, travelSegments)

        // Assert
        expect(destination).toBeUndefined()
      }
    )

    test("when the trip type is missing, has no destination", () => {
      // Arrange
      const travelSegments = [{ departureLocationId: 1, arrivalLocationId: 2 }]

      // Act
      const destination = determineFinalDestinationSegment(null, travelSegments)

      // Assert
      expect(destination).toBeUndefined()
    })
  })
})
