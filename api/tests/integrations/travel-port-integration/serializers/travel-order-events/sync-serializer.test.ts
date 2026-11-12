import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { SyncSerializer } from "@/integrations/travel-port-integration/serializers/travel-order-events"

describe("api/src/integrations/travel-port-integration/serializers/travel-order-events/sync-serializer.ts", () => {
  describe("SyncSerializer", () => {
    describe(".perform", () => {
      test.each(["passengers", "airReservationSegments", "serviceFeeTransaction"] as const)(
        "when %s is not preloaded, it reports the developer error",
        (association) => {
          // Arrange
          const travelOrderEvent = TravelOrderEvent.build()
          travelOrderEvent.passengers = []
          travelOrderEvent.airReservationSegments = []
          travelOrderEvent.serviceFeeTransaction = null
          travelOrderEvent[association] = undefined

          // Act & Assert
          expect(() => SyncSerializer.perform(travelOrderEvent)).toThrow(
            `Expected ${association} to be preloaded.`
          )
        }
      )

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
