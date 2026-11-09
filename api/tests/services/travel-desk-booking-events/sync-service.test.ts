import type * as Configuration from "@/config"

import sourceDatabase from "@/integrations/travelport-integration/db/db-migration-client"
import { TravelOrderEvent } from "@/integrations/travelport-integration/models"
import { TravelDeskBookingEvent } from "@/models"
import { IndexSerializer } from "@/serializers/travel-desk-booking-events"
import {
  SyncService,
  SourceUnavailableError,
} from "@/services/travel-desk-booking-events/sync-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"

import { travelDeskBookingEventFactory } from "@/factories"

const sourceConfiguration = vi.hoisted(() => ({ missing: false }))

vi.mock("@/config", async (importOriginal) => {
  const configuration = await importOriginal<typeof Configuration>()

  return {
    ...configuration,
    get TRAVELPORT_DB_HOST() {
      return sourceConfiguration.missing ? undefined : configuration.TRAVELPORT_DB_HOST
    },
  }
})

describe("api/src/services/travel-desk-booking-events/sync-service.ts", () => {
  describe("SyncService", () => {
    describe(".perform", () => {
      beforeEach(async () => {
        sourceConfiguration.missing = false
        await sourceDatabase("Passenger").whereIn("TravelOrderIdentifier", [910001, 910002]).del()
        await sourceDatabase("AirRsrvSeg").whereIn("TravelOrderIdentifier", [910001, 910002]).del()
        await sourceDatabase("SFTrans").whereIn("TravelOrderIdentifier", [910001, 910002]).del()
        await sourceDatabase("TravelOrderEvent")
          .whereIn("TravelOrderIdentifier", [910001, 910002])
          .del()
      })

      test("when the source is not configured, it reports source unavailability without querying", async () => {
        // Arrange
        sourceConfiguration.missing = true
        const findSourceEvents = vi.spyOn(TravelOrderEvent, "findAllByRecordLocator")

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toThrow(
          new SourceUnavailableError("Booking source is not configured.")
        )
        expect(findSourceEvents).not.toHaveBeenCalled()
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

      test("when the source returns no events, it retains cached events without returning them", async () => {
        // Arrange
        const cachedBookingEvent = await travelDeskBookingEventFactory.create()

        // Act
        const bookingEvents = await SyncService.perform("SRC001")

        // Assert
        expect(bookingEvents).toEqual([])
        expect(await TravelDeskBookingEvent.findAll()).toEqual([
          expect.objectContaining({ id: cachedBookingEvent.id }),
        ])
      })

      test("when the source lookup fails, it reports source unavailability", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAllByRecordLocator").mockRejectedValue(
          new Error("Source connection failed")
        )

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBeInstanceOf(SourceUnavailableError)
      })

      test("when local persistence fails, it preserves the original failure", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAllByRecordLocator").mockResolvedValue([
          TravelOrderEvent.build({
            travelOrderIdentifier: 910001,
            recordLocator: "SRC001",
            databaseTimestamp: new Date("2030-01-01T12:00:00Z"),
          }),
        ])
        const persistenceError = new Error("Local database write failed")
        vi.spyOn(TravelDeskBookingEvent, "upsert").mockRejectedValue(persistenceError)

        // Act / Assert
        await expect(SyncService.perform("SRC001")).rejects.toBe(persistenceError)
      })

      test("when a later event cannot persist, it rolls back all event changes", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAllByRecordLocator").mockResolvedValue([
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
        const upsert = TravelDeskBookingEvent.upsert.bind(TravelDeskBookingEvent)
        vi.spyOn(TravelDeskBookingEvent, "upsert")
          .mockImplementationOnce((attributes, options) => upsert(attributes, options))
          .mockRejectedValueOnce(new Error("Second local write failed"))

        // Act
        await expect(SyncService.perform("SRC001")).rejects.toThrow()

        // Assert
        expect(await TravelDeskBookingEvent.findAll()).toEqual([])
      })

      test("when the record locator is invalid, it rejects before reading the source", async () => {
        // Arrange
        const findSourceEvents = vi.spyOn(TravelOrderEvent, "findAllByRecordLocator")

        // Act / Assert
        await expect(SyncService.perform("invalid")).rejects.toBeInstanceOf(InvoiceValidationError)
        expect(findSourceEvents).not.toHaveBeenCalled()
      })
    })
  })
})
