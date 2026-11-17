import { db } from "@/db/db-migration-client"
import {
  down,
  up,
} from "@/db/migrations/20261116000001_rename-booking-event-record-locator-to-booking-reference"

describe("api/src/db/migrations/20261116000001_rename-booking-event-record-locator-to-booking-reference.ts", () => {
  describe("booking event reference migration", () => {
    describe.each(["up", "down"] as const)(".%s", (direction) => {
      test("when cached events already exist, it renames the column without changing values", async () => {
        // Arrange
        const oldColumn = direction === "up" ? "record_locator" : "booking_reference"
        const newColumn = direction === "up" ? "booking_reference" : "record_locator"
        const migrate = direction === "up" ? up : down
        await db.transaction(async (transaction) => {
          // Temporary migration fixtures shadow the application table on this connection only.
          await transaction.raw(`
            CREATE TEMPORARY TABLE travel_desk_booking_events (
              id integer,
              ${oldColumn} text
            ) ON COMMIT DROP
          `)
          await transaction("travel_desk_booking_events").insert([
            { id: 1, [oldColumn]: "SRC001" },
            { id: 2, [oldColumn]: null },
          ])

          // Act
          await migrate(transaction)
          const bookingEvents = await transaction("travel_desk_booking_events")
            .select("*")
            .orderBy("id")

          // Assert
          expect(bookingEvents).toEqual([
            { id: 1, [newColumn]: "SRC001" },
            { id: 2, [newColumn]: null },
          ])
        })
      })
    })
  })
})
