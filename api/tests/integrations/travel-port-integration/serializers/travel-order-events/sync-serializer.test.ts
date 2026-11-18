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
        expect(() => SyncSerializer.perform(travelOrderEvent, "SRC001")).toThrow(
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
        expect(() => SyncSerializer.perform(travelOrderEvent, "SRC001")).toThrow(
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
        expect(() => SyncSerializer.perform(travelOrderEvent, "SRC001")).toThrow(
          "Expected serviceFeeTransaction to be preloaded."
        )
      })

      test("when preloaded relationships have no records, it preserves their empty values", () => {
        // Arrange
        const travelOrderEvent = TravelOrderEvent.build({
          travelOrderIdentifier: 940001,
          recordLocator: "source value",
          databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
        })
        travelOrderEvent.passengers = []
        travelOrderEvent.airReservationSegments = []
        travelOrderEvent.serviceFeeTransaction = null

        // Act
        const serializedTravelOrderEvent = SyncSerializer.perform(travelOrderEvent, "SRC001")

        // Assert
        expect(serializedTravelOrderEvent).toEqual({
          externalTravelPortIdentifier: 940001,
          bookingReference: "SRC001",
          externalCreatedAt: new Date("2030-01-01T12:00:00Z"),
          bookingFileVersionNumber: undefined,
          hostEventTimestamp: undefined,
          eventType: null,
          reservationSystemDescription: null,
          passengerNameRecordCreatedAt: undefined,
          owningAgencyName: null,
          transactionAgencyName: null,
          transactionAgent: null,
          creatingAgencyInternationalAirTransportAssociationNumber: null,
          passengers: [],
          airReservationSegments: [],
          serviceFeeTransaction: null,
        })
      })
    })
  })
})
