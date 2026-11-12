import sourceDatabase from "@/integrations/travel-port-integration/db/db-migration-client"
import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { TravelDeskBookingEvent } from "@/models"
import { SyncService } from "@/services/travel-desk-booking-events/sync-service"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

import {
  airReservationSegmentFactory,
  passengerFactory,
  serviceFeeTransactionFactory,
  travelDeskBookingEventFactory,
  travelOrderEventFactory,
} from "@/factories"

describe("api/src/services/travel-desk-booking-events/sync-service.ts", () => {
  describe("SyncService", () => {
    describe(".perform", () => {
      test("when fees arrive separately, it preserves source precision without leaking passenger remarks", async () => {
        // Arrange
        const bookingEvent = await travelOrderEventFactory.create({
          travelOrderIdentifier: 910001,
          recordLocator: "SRC001",
          bookingFileVersionNumber: 8,
          eventType: "B",
          databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
          crsDescription: "Galileo",
          pnrCreationDate: new Date("2030-01-01T10:00:00Z"),
          creatingAgencyIata: "12345678",
        })
        const feeEvent = await travelOrderEventFactory.create({
          travelOrderIdentifier: 910002,
          recordLocator: "SRC001",
          bookingFileVersionNumber: null,
          eventType: "T",
          databaseTimestamp: new Date("2030-01-02T12:00:00Z"),
        })
        await passengerFactory.create({
          travelOrderIdentifier: bookingEvent.travelOrderIdentifier,
          lastNameElement: 1,
          passengerElement: 1,
          firstName: "Ada   ",
          lastName: "Example",
          nameRemark: "Private source-only remark",
        })
        await airReservationSegmentFactory.create({
          travelOrderIdentifier: bookingEvent.travelOrderIdentifier,
          airSegmentNumber: 1,
          segmentStatus: "GK",
          boardPoint: "YXY",
          offPoint: "YVR",
          departureDate: "0000-00-00",
          departureTime: "00:00",
        })
        await serviceFeeTransactionFactory.create({
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
            recordLocator: "SRC001",
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

      test("when a lowercase source locator is refreshed, it normalizes and updates one local row without duplicates", async () => {
        // Arrange
        await sourceDatabase("TravelOrderEvent").insert({
          TravelOrderIdentifier: 910001,
          RecordLocator: "src001",
          PnrBfVersionNbr: 1,
          DatabaseTimeStamp: "2030-01-01T12:00:00",
        })
        const originalBookingEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          recordLocator: "SRC001",
          bookingFileVersionNumber: 1,
        })
        await SyncService.perform("SRC001")
        await sourceDatabase("TravelOrderEvent")
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
            recordLocator: "SRC001",
          }),
        ])
      })

      test("when the source returns no events, it deletes only that locator's cached events", async () => {
        // Arrange
        await travelDeskBookingEventFactory.create({ recordLocator: "SRC001" })
        const unrelatedEvent = await travelDeskBookingEventFactory.create({
          recordLocator: "OTHER1",
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
        await sourceDatabase("TravelOrderEvent").insert({
          TravelOrderIdentifier: 910001,
          RecordLocator: "SRC001",
          DatabaseTimeStamp: "2030-01-01T12:00:00",
        })
        const retainedEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          recordLocator: "SRC001",
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910002,
          recordLocator: "SRC001",
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
          recordLocator: "SRC001",
        })
        await deletedEvent.destroy()
        await sourceDatabase("TravelOrderEvent").insert({
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
          recordLocator: "SRC001",
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
        vi.spyOn(TravelOrderEvent, "findAll").mockResolvedValue(
          [
            TravelOrderEvent.build({
              travelOrderIdentifier: 910001,
              recordLocator: "SRC001",
              databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
            }),
          ].map((event) =>
            Object.assign(event, {
              passengers: [],
              airReservationSegments: [],
              serviceFeeTransaction: null,
            })
          )
        )
        const persistenceError = new Error("Local database write failed")
        vi.spyOn(TravelDeskBookingEvent, "create").mockRejectedValue(persistenceError)

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBe(persistenceError)
      })

      test("when a later event cannot persist, it rolls back all event changes", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAll").mockResolvedValue(
          [
            TravelOrderEvent.build({
              travelOrderIdentifier: 910001,
              recordLocator: "SRC001",
              databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
            }),
            TravelOrderEvent.build({
              travelOrderIdentifier: 910002,
              recordLocator: "SRC001",
              databaseTimestamp: new Date("2030-01-02T12:00:00Z"),
            }),
          ].map((event) =>
            Object.assign(event, {
              passengers: [],
              airReservationSegments: [],
              serviceFeeTransaction: null,
            })
          )
        )
        const create = TravelDeskBookingEvent.create.bind(TravelDeskBookingEvent)
        vi.spyOn(TravelDeskBookingEvent, "create")
          .mockImplementationOnce((attributes, options) => create(attributes, options))
          .mockRejectedValueOnce(new Error("Second local write failed"))

        // Act
        await SyncService.perform("SRC001").catch(() => undefined)

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([])
      })

      test("when a later event cannot persist, it rolls back updates to cached events", async () => {
        // Arrange
        const cachedBookingEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 910001,
          recordLocator: "SRC001",
          bookingFileVersionNumber: 1,
        })
        vi.spyOn(TravelOrderEvent, "findAll").mockResolvedValue(
          [
            TravelOrderEvent.build({
              travelOrderIdentifier: 910001,
              recordLocator: "SRC001",
              bookingFileVersionNumber: 2,
              databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
            }),
            TravelOrderEvent.build({
              travelOrderIdentifier: 910002,
              recordLocator: "SRC001",
              databaseTimestamp: new Date("2030-01-02T12:00:00Z"),
            }),
          ].map((event) =>
            Object.assign(event, {
              passengers: [],
              airReservationSegments: [],
              serviceFeeTransaction: null,
            })
          )
        )
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
        vi.spyOn(TravelOrderEvent, "findAll").mockResolvedValue(
          [
            TravelOrderEvent.build({
              travelOrderIdentifier: 910001,
              recordLocator: "SRC001",
              databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
            }),
            TravelOrderEvent.build({
              travelOrderIdentifier: 910002,
              recordLocator: "SRC001",
              databaseTimestamp: new Date("2030-01-02T12:00:00Z"),
            }),
          ].map((event) =>
            Object.assign(event, {
              passengers: [],
              airReservationSegments: [],
              serviceFeeTransaction: null,
            })
          )
        )
        const create = TravelDeskBookingEvent.create.bind(TravelDeskBookingEvent)
        const persistenceError = new Error("Second local write failed")
        vi.spyOn(TravelDeskBookingEvent, "create")
          .mockImplementationOnce((attributes, options) => create(attributes, options))
          .mockRejectedValueOnce(persistenceError)

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBe(persistenceError)
      })

      test("when an unrestricted locator matches no source events, it preserves other cached bookings", async () => {
        // Arrange
        const cachedBookingEvent = await travelDeskBookingEventFactory.create({
          recordLocator: "SRC001",
        })

        // Act
        await SyncService.perform("not-a-six-character-locator")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({ id: cachedBookingEvent.id, deletedAt: null }),
        ])
      })
    })
  })
})
