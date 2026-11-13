import { IndexSerializer } from "@/serializers/travel-desk-booking-events"

import { travelDeskBookingEventFactory } from "@/factories"

describe("api/src/serializers/travel-desk-booking-events/index-serializer.ts", () => {
  describe("IndexSerializer", () => {
    describe(".perform", () => {
      test("when timestamps include an offset and an absent value, it returns UTC instants and null", () => {
        // Arrange
        const bookingEvent = travelDeskBookingEventFactory.build({
          databaseTimestamp: new Date("2030-01-01T05:00:00.123-07:00"),
          hostEventTimestamp: null,
          passengerNameRecordCreatedAt: new Date("2030-01-01T04:00:00.000-07:00"),
        })

        // Act
        const result = IndexSerializer.perform(bookingEvent)

        // Assert
        expect(result).toMatchObject({
          databaseTimestamp: "2030-01-01T12:00:00.123Z",
          hostEventTimestamp: null,
          passengerNameRecordCreatedAt: "2030-01-01T11:00:00.000Z",
        })
      })

      test("when a timestamp is invalid, it rejects rather than returning a missing timestamp", () => {
        // Arrange
        const bookingEvent = travelDeskBookingEventFactory.build()
        bookingEvent.setDataValue("hostEventTimestamp", new Date(NaN))

        // Act / Assert
        expect(() => IndexSerializer.perform(bookingEvent)).toThrow(
          "Cannot serialize an invalid booking event timestamp."
        )
      })
    })
  })
})
