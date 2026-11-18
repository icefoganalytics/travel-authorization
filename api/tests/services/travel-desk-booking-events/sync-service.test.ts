import travelPortDb from "@/integrations/travel-port-integration/db/db-client"
import travelPortMigrationClient from "@/integrations/travel-port-integration/db/db-migration-client"
import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import RawBookingEventSnapshotQuery from "@/integrations/travel-port-integration/queries/raw-booking-event-snapshot-query"
import { TravelDeskBookingEvent } from "@/models"
import { SyncService } from "@/services/travel-desk-booking-events/sync-service"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

import { travelDeskBookingEventFactory, TravelPortIntegration } from "@/factories"

describe("api/src/services/travel-desk-booking-events/sync-service.ts", () => {
  describe("SyncService", () => {
    describe(".perform", () => {
      test("when fees arrive separately, it preserves source precision without leaking passenger remarks", async () => {
        // Arrange
        const bookingEvent = await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910001,
          recordLocator: "SRC001",
          bookingFileVersionNumber: 8,
          eventType: "B",
          databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
          crsDescription: "Galileo",
          pnrCreationDate: new Date("2030-01-01T10:00:00Z"),
          creatingAgencyIata: "12345678",
        })
        const feeEvent = await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910002,
          recordLocator: "SRC001",
          bookingFileVersionNumber: null,
          eventType: "T",
          databaseTimestamp: new Date("2030-01-02T12:00:00Z"),
        })
        await TravelPortIntegration.passengerFactory.create({
          travelOrderIdentifier: bookingEvent.travelOrderIdentifier,
          lastNameElement: 1,
          passengerElement: 1,
          firstName: "Ada   ",
          lastName: "Example",
          nameRemark: "Private source-only remark",
        })
        await TravelPortIntegration.airReservationSegmentFactory.create({
          travelOrderIdentifier: bookingEvent.travelOrderIdentifier,
          airSegmentNumber: 1,
          segmentStatus: "GK",
          boardPoint: "YXY",
          offPoint: "YVR",
          departureDate: "0000-00-00",
          departureTime: "00:00",
        })
        await TravelPortIntegration.serviceFeeTransactionFactory.create({
          travelOrderIdentifier: feeEvent.travelOrderIdentifier,
          activeVoidStatus: "A",
          currencyCode: "CAD",
          serviceFeeAmount: "42.125",
          commissionAmount: "0.000",
        })

        // Act
        await SyncService.perform("SRC001")
        const bookingEvents = await TravelDeskBookingEvent.findAll({
          order: [["externalTravelPortIdentifier", "ASC"]],
        })

        // Assert
        expect(bookingEvents).toEqual([
          expect.objectContaining({
            externalTravelPortIdentifier: 910001,
            bookingFileVersionNumber: 8,
            eventType: "B",
            bookingReference: "SRC001",
            reservationSystemDescription: "Galileo",
            passengerNameRecordCreatedAt: new Date("2030-01-01T10:00:00.000Z"),
            creatingAgencyInternationalAirTransportAssociationNumber: "12345678",
            passengers: [
              { lastNameElement: 1, passengerElement: 1, firstName: "Ada", lastName: "Example" },
            ],
            airReservationSegments: [
              expect.objectContaining({
                airSegmentNumber: 1,
                segmentStatus: "GK",
                boardPoint: "YXY",
                offPoint: "YVR",
                departureDate: "0000-00-00",
                departureTime: "00:00",
              }),
            ],
            serviceFeeTransaction: null,
          }),
          expect.objectContaining({
            externalTravelPortIdentifier: 910002,
            bookingFileVersionNumber: null,
            eventType: "T",
            passengers: [],
            airReservationSegments: [],
            serviceFeeTransaction: {
              activeVoidStatus: "A",
              serviceFeeDocumentNumber: null,
              issueDate: null,
              currencyCode: "CAD",
              serviceFeeAmount: "42.125",
              commissionAmount: expect.stringMatching(/^0(?:\.0{1,3})?$/),
              nameOnServiceFee: null,
              relatedTicketDocumentNumber: null,
              relatedInvoiceNumber: null,
            },
          }),
        ])
      })

      test("when a legacy cached event is resynced, it captures the raw source without fabricating missing associations", async () => {
        // Arrange
        const cachedEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          bookingReference: "SRC001",
          bookingFileVersionNumber: 1,
          rawSourceSnapshot: null,
        })
        await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910001,
          recordLocator: "SRC001",
          bookingFileVersionNumber: 2,
        })

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({
            id: cachedEvent.id,
            bookingFileVersionNumber: 2,
            rawSourceSnapshot: {
              travelOrderEvent: expect.objectContaining({
                TravelOrderIdentifier: 910001,
                PnrBfVersionNbr: 2,
                RecordLocator: "SRC001",
              }),
              passengers: [],
              airReservationSegments: [],
              serviceFeeTransaction: null,
            },
          }),
        ])
      })

      test("when source values are omitted or normalized locally, it retains every original column and decimal digit", async () => {
        // Arrange
        const sourceEvent = await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910001,
          recordLocator: "SRC001",
          transactionPseudo: "AB",
          transactionAgent: "Agent",
          originalBookingLocation: "ABC",
          creatingAgencyIata: "123456789012345678",
          lastActionAgentId: "LAST",
          pnrPurgeDate: new Date("2031-01-01T00:00:00Z"),
        })
        await TravelPortIntegration.passengerFactory.create({
          travelOrderIdentifier: sourceEvent.travelOrderIdentifier,
          lastNameElement: 1,
          passengerElement: 1,
          absoluteNameElement: 7,
          firstName: " Ada  ",
          nameRemark: "Private source-only remark  ",
        })
        await TravelPortIntegration.airReservationSegmentFactory.create({
          travelOrderIdentifier: sourceEvent.travelOrderIdentifier,
          airSegmentNumber: 1,
          boardPoint: "YXY",
          classOfServiceDescription: " Economy  ",
        })
        await TravelPortIntegration.serviceFeeTransactionFactory.create({
          travelOrderIdentifier: sourceEvent.travelOrderIdentifier,
          serviceFeeAmount: "123456789012345.125",
          commissionAmount: "0.001",
          relatedInvoiceNumber: " INV001  ",
        })

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({
            passengers: [
              expect.objectContaining({
                firstName: "Ada",
              }),
            ],
            rawSourceSnapshot: {
              travelOrderEvent: expect.objectContaining({
                TravelOrderIdentifier: 910001,
                TransactionPseudo: "AB  ",
                TransactionAgent: "Agent   ",
                OriginalBookingLocation: "ABC  ",
                CreatingAgencyIata: "123456789012345678",
                LastActionAgentID: "LAST   ",
                PnrPurgeDate: "2031-01-01T00:00:00",
              }),
              passengers: [
                expect.objectContaining({
                  TravelOrderIdentifier: 910001,
                  AbsoluteNameElement: 7,
                  FirstName: " Ada  ",
                  NameRemark: "Private source-only remark  ",
                }),
              ],
              airReservationSegments: [
                expect.objectContaining({
                  TravelOrderIdentifier: 910001,
                  AirSegmentNbr: 1,
                  BoardPoint: "YXY  ",
                  ClassOfServDesc: " Economy  ",
                }),
              ],
              serviceFeeTransaction: expect.objectContaining({
                TravelOrderIdentifier: 910001,
                ServiceFeeAmount: "123456789012345.125",
                SFCommissionAmount: "0.001",
                RelatedInvoiceNbr: " INV001  ",
              }),
            },
          }),
        ])
      })

      test("when raw rows are captured, all four reads share the normalized source transaction", async () => {
        // Arrange
        await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910001,
          recordLocator: "SRC001",
        })
        const sourceQuery = vi.spyOn(travelPortDb, "query")
        const sourceFind = vi.spyOn(TravelOrderEvent, "findAll")

        // Act
        await SyncService.perform("SRC001")
        const sourceTransaction = sourceFind.mock.calls[0]?.[0]?.transaction
        const rawQueryOptions = sourceQuery.mock.calls
          .map(([, options]) => options)
          .filter((options) => {
            const bindings = options?.bind
            return bindings !== undefined && "travelOrderIdentifier" in bindings
          })

        // Assert
        expect(rawQueryOptions).toEqual([
          expect.objectContaining({
            bind: { travelOrderIdentifier: 910001 },
            transaction: sourceTransaction,
          }),
          expect.objectContaining({
            bind: { travelOrderIdentifier: 910001 },
            transaction: sourceTransaction,
          }),
          expect.objectContaining({
            bind: { travelOrderIdentifier: 910001 },
            transaction: sourceTransaction,
          }),
          expect.objectContaining({
            bind: { travelOrderIdentifier: 910001 },
            transaction: sourceTransaction,
          }),
        ])
      })

      test("when a later raw source capture fails, it rolls back snapshots and normalized updates", async () => {
        // Arrange
        const cachedEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          bookingReference: "SRC001",
          bookingFileVersionNumber: 1,
          rawSourceSnapshot: null,
        })
        await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910001,
          recordLocator: "SRC001",
          bookingFileVersionNumber: 2,
        })
        await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910002,
          recordLocator: "SRC001",
        })
        const readSnapshot = RawBookingEventSnapshotQuery.prototype.read
        vi.spyOn(RawBookingEventSnapshotQuery.prototype, "read")
          .mockImplementationOnce(readSnapshot)
          .mockRejectedValueOnce(new Error("Later source snapshot read failed"))

        // Act
        await SyncService.perform("SRC001").catch(() => undefined)

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({
            id: cachedEvent.id,
            bookingFileVersionNumber: 1,
            rawSourceSnapshot: null,
          }),
        ])
      })

      test.each(["src001", " SRC001", "SRC001 "])(
        "when the booking reference is %j, it rejects the non-normalized input",
        async (bookingReference) => {
          // Arrange
          const service = new SyncService(bookingReference)

          // Act
          const result = service.perform()

          // Assert
          await expect(result).rejects.toThrow(
            "Booking reference must be uppercase without leading or trailing whitespace."
          )
        }
      )

      test("when a lowercase source locator is refreshed with an uppercase reference, it updates the local row without duplicates", async () => {
        // Arrange
        await travelPortMigrationClient("TravelOrderEvent").insert({
          TravelOrderIdentifier: 910001,
          RecordLocator: "src001",
          PnrBfVersionNbr: 1,
          DatabaseTimeStamp: "2030-01-01T12:00:00",
        })
        const originalBookingEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          bookingReference: "SRC001",
          bookingFileVersionNumber: 1,
        })
        await SyncService.perform("SRC001")
        await travelPortMigrationClient("TravelOrderEvent")
          .where({ TravelOrderIdentifier: 910001 })
          .update({ PnrBfVersionNbr: 2 })

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({
            id: originalBookingEvent.id,
            externalTravelPortIdentifier: 910001,
            bookingFileVersionNumber: 2,
            bookingReference: "SRC001",
          }),
        ])
      })

      test("when a locator has no source events, it deletes only that locator's cached events", async () => {
        // Arrange
        await travelDeskBookingEventFactory.create({ bookingReference: "SRC001" })
        const unrelatedEvent = await travelDeskBookingEventFactory.create({
          bookingReference: "OTHER1",
        })

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({ id: unrelatedEvent.id }),
        ])
      })

      test("when one source event disappears, it removes that event from local history", async () => {
        // Arrange
        await travelPortMigrationClient("TravelOrderEvent").insert({
          TravelOrderIdentifier: 910001,
          RecordLocator: "SRC001",
          DatabaseTimeStamp: "2030-01-01T12:00:00",
        })
        const retainedEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          bookingReference: "SRC001",
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910002,
          bookingReference: "SRC001",
        })

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({ id: retainedEvent.id, deletedAt: null }),
        ])
      })

      test("when a deleted source event reappears, it creates a new local record and preserves the deleted record", async () => {
        // Arrange
        const deletedEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          bookingReference: "SRC001",
        })
        await deletedEvent.destroy()
        await travelPortMigrationClient("TravelOrderEvent").insert({
          TravelOrderIdentifier: 910001,
          RecordLocator: "SRC001",
          PnrBfVersionNbr: 2,
          DatabaseTimeStamp: "2030-01-01T12:00:00",
        })

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(
          await TravelDeskBookingEvent.findAll({ paranoid: false, order: [["id", "ASC"]] })
        ).toEqual([
          expect.objectContaining({
            id: deletedEvent.id,
            deletedAt: expect.any(Date),
          }),
          expect.objectContaining({
            externalTravelPortIdentifier: 910001,
            deletedAt: null,
            bookingFileVersionNumber: 2,
          }),
        ])
      })

      test("when the source scan fails, it preserves cached events", async () => {
        // Arrange
        const cachedEvent = await travelDeskBookingEventFactory.create({
          bookingReference: "SRC001",
        })
        vi.spyOn(TravelOrderEvent, "findAll").mockRejectedValue(new Error("Source unavailable"))

        // Act
        await SyncService.perform("SRC001").catch(() => undefined)

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({ id: cachedEvent.id, deletedAt: null }),
        ])
      })

      test("when the source lookup fails, it reports source unavailability", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAll").mockRejectedValue(
          new Error("Source connection failed")
        )

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBeInstanceOf(SourceUnavailableError)
      })

      test("when local persistence fails, it preserves the original failure", async () => {
        // Arrange
        await TravelPortIntegration.travelOrderEventFactory.create({
          recordLocator: "SRC001",
        })
        const persistenceError = new Error("Local database write failed")
        vi.spyOn(TravelDeskBookingEvent, "create").mockRejectedValue(persistenceError)

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBe(persistenceError)
      })

      test("when a later event cannot persist, it rolls back all event changes", async () => {
        // Arrange
        await TravelPortIntegration.travelOrderEventFactory.create({
          recordLocator: "SRC001",
        })
        await TravelPortIntegration.travelOrderEventFactory.create({
          recordLocator: "SRC001",
        })
        const beforeCreate = vi
          .fn<() => Promise<void>>()
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error("Second local write failed"))
        const removeBeforeCreate = TravelDeskBookingEvent.hooks.addListener(
          "beforeCreate",
          beforeCreate
        )

        try {
          // Act
          await SyncService.perform("SRC001").catch(() => undefined)

          // Assert
          expect(await TravelDeskBookingEvent.findAll()).toEqual([])
        } finally {
          removeBeforeCreate()
        }
      })

      test("when a later event cannot persist, it rolls back updates to cached events", async () => {
        // Arrange
        const cachedBookingEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          bookingReference: "SRC001",
          bookingFileVersionNumber: 1,
        })
        await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910001,
          recordLocator: "SRC001",
          bookingFileVersionNumber: 2,
        })
        await TravelPortIntegration.travelOrderEventFactory.create({
          travelOrderIdentifier: 910002,
          recordLocator: "SRC001",
        })
        vi.spyOn(TravelDeskBookingEvent, "create").mockRejectedValue(
          new Error("Later local write failed")
        )

        // Act
        await SyncService.perform("SRC001").catch(() => undefined)

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({
            id: cachedBookingEvent.id,
            bookingFileVersionNumber: 1,
          }),
        ])
      })

      test("when a later event cannot persist, it propagates the write failure", async () => {
        // Arrange
        await TravelPortIntegration.travelOrderEventFactory.create({
          recordLocator: "SRC001",
        })
        await TravelPortIntegration.travelOrderEventFactory.create({
          recordLocator: "SRC001",
        })
        const persistenceError = new Error("Second local write failed")
        const beforeCreate = vi
          .fn<() => Promise<void>>()
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(persistenceError)
        const removeBeforeCreate = TravelDeskBookingEvent.hooks.addListener(
          "beforeCreate",
          beforeCreate
        )

        try {
          // Act / Assert
          await expect(SyncService.perform("SRC001")).rejects.toBe(persistenceError)
        } finally {
          removeBeforeCreate()
        }
      })

      test("when an unrestricted locator matches no source events, it preserves other cached bookings", async () => {
        // Arrange
        const cachedBookingEvent = await travelDeskBookingEventFactory.create({
          bookingReference: "SRC001",
        })

        // Act
        await SyncService.perform("NOT-A-SIX-CHARACTER-LOCATOR")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({
            id: cachedBookingEvent.id,
            deletedAt: null,
          }),
        ])
      })
    })
  })
})
