import { db } from "@/db/db-migration-client"
import {
  down,
  up,
} from "@/db/migrations/20261116000001_rename-booking-event-record-locator-to-booking-reference"

describe("api/src/db/migrations/20261116000001_rename-booking-event-record-locator-to-booking-reference.ts", () => {
  describe("booking event reference migration", () => {
    describe(".up", () => {
      test("when cached events already exist, it renames record_locator to booking_reference without changing values", async () => {
        await db.transaction(async (transaction) => {
          // Arrange
          // Temporary migration fixtures shadow the application table on this connection only.
          await transaction.raw(`
            CREATE TEMPORARY TABLE travel_desk_booking_events (
              id integer,
              record_locator text
            ) ON COMMIT DROP
          `)
          await transaction("travel_desk_booking_events").insert([
            {
              id: 1,
              record_locator: "SRC001",
            },
            {
              id: 2,
              record_locator: null,
            },
          ])

          // Act
          await up(transaction)
          const bookingEvents = await transaction("travel_desk_booking_events")
            .select("*")
            .orderBy("id")

          // Assert
          expect(bookingEvents).toEqual([
            {
              id: 1,
              booking_reference: "SRC001",
            },
            {
              id: 2,
              booking_reference: null,
            },
          ])
        })
      })
    })

    describe(".down", () => {
      test("when cached events already exist, it renames booking_reference to record_locator without changing values", async () => {
        await db.transaction(async (transaction) => {
          // Arrange
          // Temporary migration fixtures shadow the application table on this connection only.
          await transaction.raw(`
            CREATE TEMPORARY TABLE travel_desk_booking_events (
              id integer,
              booking_reference text
            ) ON COMMIT DROP
          `)
          await transaction("travel_desk_booking_events").insert([
            {
              id: 1,
              booking_reference: "SRC001",
            },
            {
              id: 2,
              booking_reference: null,
            },
          ])

          // Act
          await down(transaction)
          const bookingEvents = await transaction("travel_desk_booking_events")
            .select("*")
            .orderBy("id")

          // Assert
          expect(bookingEvents).toEqual([
            {
              id: 1,
              record_locator: "SRC001",
            },
            {
              id: 2,
              record_locator: null,
            },
          ])
        })
      })
    })
  })
})
