import { TravelAuthorization } from "@/models"

import { locationFactory, travelSegmentFactory } from "@/factories"

import DetermineFinalDestinationService from "@/services/travel-authorizations/determine-final-destination-service"

describe("api/src/services/travel-authorizations/determine-final-destination-service.ts", () => {
  describe("DetermineFinalDestinationService", () => {
    describe("#perform", () => {
      test.each(["departureLocation", "arrivalLocation"] as const)(
        "when a non-final segment has an unloaded %s, it rejects the incomplete association graph",
        (association) => {
          // Arrange
          const whitehorse = locationFactory.build({ id: 1, city: "Whitehorse" })
          const vancouver = locationFactory.build({ id: 2, city: "Vancouver" })
          const toronto = locationFactory.build({ id: 3, city: "Toronto" })
          const travelSegment1 = travelSegmentFactory
            .associations({
              departureLocation: whitehorse,
              arrivalLocation: vancouver,
            })
            .build({
              segmentNumber: 1,
              isActual: false,
            })
          travelSegment1[association] = undefined

          const travelSegment2 = travelSegmentFactory
            .associations({
              departureLocation: vancouver,
              arrivalLocation: toronto,
            })
            .build({
              segmentNumber: 2,
              isActual: false,
            })

          const travelSegments = [travelSegment1, travelSegment2]

          // Act & Assert
          expect(() =>
            DetermineFinalDestinationService.perform(
              TravelAuthorization.TripTypes.ONE_WAY,
              travelSegments,
              null
            )
          ).toThrow("Expected travel segment locations to be pre-loaded.")
        }
      )
    })
  })
})
