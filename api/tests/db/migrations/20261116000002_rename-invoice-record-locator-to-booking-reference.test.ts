import { db } from "@/db/db-migration-client"
import {
  down,
  up,
} from "@/db/migrations/20261116000002_rename-invoice-record-locator-to-booking-reference"

describe("api/src/db/migrations/20261116000002_rename-invoice-record-locator-to-booking-reference.ts", () => {
  describe("invoice booking reference migration", () => {
    describe.each(["up", "down"] as const)(".%s", (direction) => {
      test("when saved snapshots contain source references, it renames only local reference keys and preserves order and nulls", async () => {
        // Arrange
        const oldColumn = direction === "up" ? "record_locator" : "booking_reference"
        const newColumn = direction === "up" ? "booking_reference" : "record_locator"
        const oldKey = direction === "up" ? "recordLocator" : "bookingReference"
        const newKey = direction === "up" ? "bookingReference" : "recordLocator"
        const migrate = direction === "up" ? up : down
        await db.transaction(async (transaction) => {
          // Temporary migration fixtures shadow the application table on this connection only.
          await transaction.raw(`
            CREATE TEMPORARY TABLE travel_desk_invoices (
              id integer,
              ${oldColumn} text,
              source_snapshot jsonb
            ) ON COMMIT DROP
          `)
          await transaction("travel_desk_invoices").insert({
            id: 1,
            [oldColumn]: "SRC001",
            source_snapshot: JSON.stringify({
              bookingEvent: {
                [oldKey]: "SRC001",
                travelOrderIdentifier: 123,
                airReservationSegments: [{ airSegmentNumber: 1 }],
                sourceMetadata: { recordLocator: "REMOTE" },
              },
              serviceFeeEvents: [
                { [oldKey]: "SRC001", travelOrderIdentifier: 456 },
                { [oldKey]: null, travelOrderIdentifier: 124 },
                { travelOrderIdentifier: 789 },
                null,
              ],
              otherField: { recordLocator: "UNRELATED" },
            }),
          })

          // Act
          await migrate(transaction)
          const invoices = await transaction("travel_desk_invoices").select("*")

          // Assert
          expect(invoices).toEqual([
            {
              id: 1,
              [newColumn]: "SRC001",
              source_snapshot: {
                bookingEvent: {
                  [newKey]: "SRC001",
                  travelOrderIdentifier: 123,
                  airReservationSegments: [{ airSegmentNumber: 1 }],
                  sourceMetadata: { recordLocator: "REMOTE" },
                },
                serviceFeeEvents: [
                  { [newKey]: "SRC001", travelOrderIdentifier: 456 },
                  { [newKey]: null, travelOrderIdentifier: 124 },
                  { travelOrderIdentifier: 789 },
                  null,
                ],
                otherField: { recordLocator: "UNRELATED" },
              },
            },
          ])
        })
      })

      test.each([
        {},
        { bookingEvent: null, serviceFeeEvents: null },
        { bookingEvent: {}, serviceFeeEvents: [] },
        { bookingEvent: { unrelated: null }, serviceFeeEvents: [{ unrelated: "kept" }] },
        null,
      ])("when a snapshot is %j, it preserves absent keys and null values", async (snapshot) => {
        // Arrange
        const oldColumn = direction === "up" ? "record_locator" : "booking_reference"
        const newColumn = direction === "up" ? "booking_reference" : "record_locator"
        const migrate = direction === "up" ? up : down
        await db.transaction(async (transaction) => {
          await transaction.raw(`
            CREATE TEMPORARY TABLE travel_desk_invoices (
              id integer,
              ${oldColumn} text,
              source_snapshot jsonb
            ) ON COMMIT DROP
          `)
          await transaction("travel_desk_invoices").insert({
            id: 1,
            [oldColumn]: "SRC001",
            source_snapshot: JSON.stringify(snapshot),
          })

          // Act
          await migrate(transaction)
          const invoices = await transaction("travel_desk_invoices").select("*")

          // Assert
          expect(invoices).toEqual([
            { id: 1, [newColumn]: "SRC001", source_snapshot: snapshot },
          ])
        })
      })
    })
  })
})
