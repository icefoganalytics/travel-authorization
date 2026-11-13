import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { SyncSerializer } from "@/integrations/travel-port-integration/serializers/travel-order-events"

describe("api/src/integrations/travel-port-integration/serializers/travel-order-events/sync-serializer.ts", () => {
  describe("SyncSerializer", () => {
    describe(".perform", () => {
      test("when passengers are not preloaded, it reports the developer error", () => {
        // Arrange
        const travelOrderEvent = TravelOrderEvent.build()
        travelOrderEvent.passengers = undefined
        travelOrderEvent.airReservationSegments = []
        travelOrderEvent.serviceFeeTransaction = null

        // Act & Assert
        expect(() => SyncSerializer.perform(travelOrderEvent)).toThrow(
          "Expected passengers to be preloaded."
        )
      })

      test("when air reservation segments are not preloaded, it reports the developer error", () => {
        // Arrange
        const travelOrderEvent = TravelOrderEvent.build()
        travelOrderEvent.passengers = []
        travelOrderEvent.airReservationSegments = undefined
        travelOrderEvent.serviceFeeTransaction = null

        // Act & Assert
        expect(() => SyncSerializer.perform(travelOrderEvent)).toThrow(
          "Expected airReservationSegments to be preloaded."
        )
      })

      test("when the service fee transaction is not preloaded, it reports the developer error", () => {
        // Arrange
        const travelOrderEvent = TravelOrderEvent.build()
        travelOrderEvent.passengers = []
        travelOrderEvent.airReservationSegments = []
        travelOrderEvent.serviceFeeTransaction = undefined

        // Act & Assert
        expect(() => SyncSerializer.perform(travelOrderEvent)).toThrow(
          "Expected serviceFeeTransaction to be preloaded."
        )
      })

      test("when preloaded relationships have no records, it preserves their empty values", () => {
        // Arrange
        const travelOrderEvent = TravelOrderEvent.build()
        travelOrderEvent.passengers = []
        travelOrderEvent.airReservationSegments = []
        travelOrderEvent.serviceFeeTransaction = null

        // Act
        const serializedTravelOrderEvent = SyncSerializer.perform(travelOrderEvent)

        // Assert
        expect(serializedTravelOrderEvent).toMatchObject({
          passengers: [],
          airReservationSegments: [],
          serviceFeeTransaction: null,
        })
      })
    })
  })
})
