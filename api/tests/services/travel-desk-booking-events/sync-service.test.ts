import sourceDatabase from "@/integrations/travelport-integration/db/db-migration-client"
import { TravelOrderEvent } from "@/integrations/travelport-integration/models"
import { TravelDeskBookingEvent } from "@/models"
import { IndexSerializer } from "@/serializers/travel-desk-booking-events"
import { SyncService } from "@/services/travel-desk-booking-events/sync-service"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"

import { travelDeskBookingEventFactory } from "@/factories"

describe("api/src/services/travel-desk-booking-events/sync-service.ts", () => {
  describe("SyncService", () => {
    describe(".perform", () => {
      beforeEach(async () => {
        await sourceDatabase("Passenger").whereIn("TravelOrderIdentifier", [910001, 910002]).del()
        await sourceDatabase("AirRsrvSeg").whereIn("TravelOrderIdentifier", [910001, 910002]).del()
        await sourceDatabase("SFTrans").whereIn("TravelOrderIdentifier", [910001, 910002]).del()
        await sourceDatabase("TravelOrderEvent")
          .whereIn("TravelOrderIdentifier", [910001, 910002])
          .del()
      })

      test("when fees arrive separately, it preserves source precision without leaking passenger remarks", async () => {
        // Arrange
        await sourceDatabase("TravelOrderEvent").insert([
          {
            TravelOrderIdentifier: 910001,
            RecordLocator: "SRC001",
            PnrBfVersionNbr: 8,
            EventType: "B",
            DatabaseTimeStamp: "2030-01-01T12:00:00",
            CrsDescription: "Galileo",
            PnrCreationDate: "2030-01-01T10:00:00",
            CreatingAgencyIata: "12345678",
          },
          {
            TravelOrderIdentifier: 910002,
            RecordLocator: "SRC001",
            PnrBfVersionNbr: null,
            EventType: "T",
            DatabaseTimeStamp: "2030-01-02T12:00:00",
          },
        ])
        await sourceDatabase("Passenger").insert({
          TravelOrderIdentifier: 910001,
          LastNameElement: 1,
          PassengerElement: 1,
          FirstName: "Ada   ",
          LastName: "Example",
          NameRemark: "Private source-only remark",
        })
        await sourceDatabase("AirRsrvSeg").insert({
          TravelOrderIdentifier: 910001,
          AirSegmentNbr: 1,
          SegmentStatus: "GK",
          BoardPoint: "YXY",
          OffPoint: "YVR",
          DepartureDate: "0000-00-00",
          DepartureTime: "00:00",
        })
        await sourceDatabase("SFTrans").insert({
          TravelOrderIdentifier: 910002,
          SFActiveVoidStatus: "A",
          SFCurrencyCode: "CAD",
          ServiceFeeAmount: "42.125",
          SFCommissionAmount: "0.000",
        })

        // Act
        const bookingEvents = await SyncService.perform(" src001 ")
        const events = IndexSerializer.perform(bookingEvents)

        // Assert
        expect(events).toEqual([
          expect.objectContaining({
            travelOrderIdentifier: 910001,
            bookingFileVersionNumber: 8,
            eventType: "B",
            recordLocator: "SRC001",
            reservationSystemDescription: "Galileo",
            passengerNameRecordCreatedAt: "2030-01-01T10:00:00.000Z",
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
            travelOrderIdentifier: 910002,
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
        const [originalBookingEvent] = await SyncService.perform("SRC001")
        await sourceDatabase("TravelOrderEvent")
          .where({ TravelOrderIdentifier: 910001 })
          .update({ PnrBfVersionNbr: 2 })

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({
            id: originalBookingEvent.id,
            externalTravelportIdentifier: 910001,
            bookingFileVersionNumber: 2,
            recordLocator: "SRC001",
          }),
        ])
      })

      test("when the source returns no events, it returns no cached events", async () => {
        // Arrange
        await travelDeskBookingEventFactory.create()

        // Act
        const bookingEvents = await SyncService.perform("SRC001")

        // Assert
        expect(bookingEvents).toEqual([])
      })

      test("when the source returns no events, it retains cached events", async () => {
        // Arrange
        const cachedBookingEvent = await travelDeskBookingEventFactory.create()

        // Act
        await SyncService.perform("SRC001")

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({ id: cachedBookingEvent.id }),
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
        vi.spyOn(TravelOrderEvent, "findAll").mockResolvedValue([
          TravelOrderEvent.build({
            travelOrderIdentifier: 910001,
            recordLocator: "SRC001",
            databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
          }),
        ])
        const persistenceError = new Error("Local database write failed")
        vi.spyOn(TravelDeskBookingEvent, "create").mockRejectedValue(persistenceError)

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBe(persistenceError)
      })

      test("when a later event cannot persist, it rolls back all event changes", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAll").mockResolvedValue([
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
        ])
        const create = TravelDeskBookingEvent.create.bind(TravelDeskBookingEvent)
        vi.spyOn(TravelDeskBookingEvent, "create")
          .mockImplementationOnce((attributes, options) => create(attributes, options))
          .mockRejectedValueOnce(new Error("Second local write failed"))

        // Act
        await SyncService.perform("SRC001").catch(() => undefined)

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([])
      })

      test("when a later event cannot persist, it propagates the write failure", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAll").mockResolvedValue([
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
        ])
        const create = TravelDeskBookingEvent.create.bind(TravelDeskBookingEvent)
        const persistenceError = new Error("Second local write failed")
        vi.spyOn(TravelDeskBookingEvent, "create")
          .mockImplementationOnce((attributes, options) => create(attributes, options))
          .mockRejectedValueOnce(persistenceError)

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBe(persistenceError)
      })

      test("when the record locator is invalid, it reports a validation error", async () => {
        // Arrange
        const recordLocator = "invalid"

        // Act / Assert
        await expect(SyncService.perform(recordLocator)).rejects.toBeInstanceOf(InvoiceValidationError)
      })

      test("when the record locator is invalid, it does not read the source", async () => {
        // Arrange
        const findSourceEvents = vi.spyOn(TravelOrderEvent, "findAll")

        // Act
        await SyncService.perform("invalid").catch(() => undefined)

        // Assert
        expect(findSourceEvents).not.toHaveBeenCalled()
      })
    })
  })
})
