import { TravelAuthorization } from "@/models"
import DetermineFinalDestinationService from "@/services/travel-authorizations/determine-final-destination-service"

import { locationFactory, travelSegmentFactory } from "@/factories"

describe("api/src/services/travel-authorizations/determine-final-destination-service.ts", () => {
  describe("DetermineFinalDestinationService", () => {
    describe("#perform", () => {
      test("when a legacy multi-city itinerary is unconfirmed, it returns no saved destination", () => {
        // Arrange
        const whitehorse = locationFactory.build({
          id: 1,
          city: "Whitehorse",
        })
        const vancouver = locationFactory.build({
          id: 2,
          city: "Vancouver",
        })
        const travelSegment = travelSegmentFactory
          .associations({
            departureLocation: whitehorse,
            arrivalLocation: vancouver,
          })
          .build({
            isActual: false,
          })
        const travelSegments = [travelSegment]

        // Act
        const result = DetermineFinalDestinationService.perform(
          TravelAuthorization.TripTypes.MULTI_CITY,
          travelSegments,
          null,
          null,
          null
        )

        // Assert
        expect(result).toEqual(null)
      })

      test("when actual multi-city differs from the estimated one-way trip, it uses the actual selection", () => {
        // Arrange
        const whitehorse = locationFactory.build({
          id: 1,
          city: "Whitehorse",
        })
        const vancouver = locationFactory.build({
          id: 2,
          city: "Vancouver",
        })
        const toronto = locationFactory.build({
          id: 3,
          city: "Toronto",
        })
        const selectedTravelSegment = travelSegmentFactory
          .associations({
            departureLocation: whitehorse,
            arrivalLocation: vancouver,
          })
          .build({
            segmentNumber: 1,
            isActual: true,
          })
        const finalTravelSegment = travelSegmentFactory
          .associations({
            departureLocation: vancouver,
            arrivalLocation: toronto,
          })
          .build({
            segmentNumber: 2,
            isActual: true,
          })
        const travelSegments = [finalTravelSegment, selectedTravelSegment]

        // Act
        const result = DetermineFinalDestinationService.perform(
          TravelAuthorization.TripTypes.ONE_WAY,
          travelSegments,
          TravelAuthorization.TripTypes.MULTI_CITY,
          toronto.id,
          vancouver.id
        )

        // Assert
        expect(result).toBe(vancouver)
      })

      test("when actual round-trip differs from the estimated multi-city trip, it uses the ordinary actual arrival", () => {
        // Arrange
        const whitehorse = locationFactory.build({
          id: 1,
          city: "Whitehorse",
        })
        const vancouver = locationFactory.build({
          id: 2,
          city: "Vancouver",
        })
        const outboundTravelSegment = travelSegmentFactory
          .associations({
            departureLocation: whitehorse,
            arrivalLocation: vancouver,
          })
          .build({
            segmentNumber: 1,
            isActual: true,
          })
        const returnTravelSegment = travelSegmentFactory
          .associations({
            departureLocation: vancouver,
            arrivalLocation: whitehorse,
          })
          .build({
            segmentNumber: 2,
            isActual: true,
          })
        const travelSegments = [returnTravelSegment, outboundTravelSegment]

        // Act
        const result = DetermineFinalDestinationService.perform(
          TravelAuthorization.TripTypes.MULTI_CITY,
          travelSegments,
          TravelAuthorization.TripTypes.ROUND_TRIP,
          null,
          null
        )

        // Assert
        expect(result).toBe(vancouver)
      })

      test("when every segment has loaded locations, it returns the final arrival", () => {
        // Arrange
        const whitehorse = locationFactory.build({
          id: 1,
          city: "Whitehorse",
        })
        const vancouver = locationFactory.build({
          id: 2,
          city: "Vancouver",
        })
        const toronto = locationFactory.build({
          id: 3,
          city: "Toronto",
        })
        const travelSegment1 = travelSegmentFactory
          .associations({
            departureLocation: whitehorse,
            arrivalLocation: vancouver,
          })
          .build({
            segmentNumber: 1,
            isActual: false,
          })
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

        // Act
        const result = DetermineFinalDestinationService.perform(
          TravelAuthorization.TripTypes.ONE_WAY,
          travelSegments,
          null,
          null,
          null
        )

        // Assert
        expect(result).toBe(toronto)
      })

      test("when a non-final departure location is unloaded, it rejects the incomplete association graph", () => {
        // Arrange
        const whitehorse = locationFactory.build({
          id: 1,
          city: "Whitehorse",
        })
        const vancouver = locationFactory.build({
          id: 2,
          city: "Vancouver",
        })
        const toronto = locationFactory.build({
          id: 3,
          city: "Toronto",
        })
        const travelSegment1 = travelSegmentFactory
          .associations({
            departureLocation: whitehorse,
            arrivalLocation: vancouver,
          })
          .build({
            segmentNumber: 1,
            isActual: false,
          })
        travelSegment1.departureLocation = undefined
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
            null,
            null,
            null
          )
        ).toThrow("Expected travel segment locations to be pre-loaded.")
      })

      test("when a non-final arrival location is unloaded, it rejects the incomplete association graph", () => {
        // Arrange
        const whitehorse = locationFactory.build({
          id: 1,
          city: "Whitehorse",
        })
        const vancouver = locationFactory.build({
          id: 2,
          city: "Vancouver",
        })
        const toronto = locationFactory.build({
          id: 3,
          city: "Toronto",
        })
        const travelSegment1 = travelSegmentFactory
          .associations({
            departureLocation: whitehorse,
            arrivalLocation: vancouver,
          })
          .build({
            segmentNumber: 1,
            isActual: false,
          })
        travelSegment1.arrivalLocation = undefined
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
            null,
            null,
            null
          )
        ).toThrow("Expected travel segment locations to be pre-loaded.")
      })
    })
  })
})
