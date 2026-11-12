import {
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  TravelDeskInvoice,
} from "@/models"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { SyncService } from "@/services/travel-desk-booking-events/sync-service"

import {
  travelDeskBookingEventFactory,
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import UpdateService from "@/services/travel-desk-invoices/update-service"

describe("api/src/services/travel-desk-invoices/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test("when synchronization removes its source event, it edits from the saved snapshot and preserves omitted headers", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({
          invoiceNumber: "KEEP-314",
          grossAmount: "10.125",
        })
        await travelDeskBookingEventFactory.create({
          externalTravelportIdentifier: invoice.sourceBookingEventId,
          recordLocator: invoice.recordLocator,
        })
        await SyncService.perform(invoice.recordLocator)
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: air })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act
        await UpdateService.perform(invoice, {
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        const persistedInvoice = await TravelDeskInvoice.findByPk(invoice.id, {
          include: ["items"],
        })
        expect(persistedInvoice).toMatchObject({
          invoiceNumber: "KEEP-314",
          grossAmount: "12.001",
          sourceSnapshot: {
            bookingEvent: { eventType: "B", airReservationSegments: [{ airSegmentNumber: 1 }] },
          },
          items: [{ sourceAirSegmentNumber: 1, grossAmount: "12.001" }],
        })
      })

      test("when optional dates are cleared, it persists null dates", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({
          invoiceDate: "2026-01-01",
          bookingDate: "2026-01-02",
          grossAmount: "10.125",
        })
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: air })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act
        await UpdateService.perform(invoice, {
          currencyCode: "CAD",
          invoiceDate: "",
          bookingDate: "",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "10.125",
              position: 0,
            },
          ],
        })

        // Assert
        const persistedInvoice = await TravelDeskInvoice.findByPk(invoice.id)
        expect(persistedInvoice).toMatchObject({
          invoiceDate: null,
          bookingDate: null,
        })
      })

      test("when a source segment identity is replaced, it rejects the forged identity", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.125" })
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: air })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act
        const result = UpdateService.perform(invoice, {
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 2,
              saleType: "Sale",
              grossAmount: "99.999",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toThrow(InvoiceValidationError)
      })

      test("when a source segment identity is forged, it leaves the saved invoice unchanged", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.125" })
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: air })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act
        await UpdateService.perform(invoice, {
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 2,
              saleType: "Sale",
              grossAmount: "99.999",
              position: 0,
            },
          ],
        }).catch(() => undefined)

        // Assert
        const invoices = await TravelDeskInvoice.findAll({ include: ["items"] })
        expect(invoices).toEqual([
          expect.objectContaining({
            grossAmount: "10.125",
            items: [
              expect.objectContaining({
                sourceAirSegmentNumber: 1,
                grossAmount: "10.125",
              }),
            ],
          }),
        ])
      })

      test("when a flight segment belongs to another request, it rejects cross-request linkage", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.125" })
        const otherRequest = await travelDeskTravelRequestFactory.create()
        const traveler = await userFactory.create()
        const flightRequest = await TravelDeskFlightRequest.create({
          travelRequestId: otherRequest.id,
          departLocation: "Whitehorse (YT)",
          arriveLocation: "Vancouver (BC)",
          datePreference: "2030-01-01",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
        })
        const flightOption = await TravelDeskFlightOption.create({
          flightRequestId: flightRequest.id,
          travelerId: traveler.id,
          cost: "100",
          leg: "Outbound",
          duration: "2h",
        })
        const segment = await TravelDeskFlightSegment.create({
          flightOptionId: flightOption.id,
          flightNumber: "ZZ1001",
          departAt: new Date("2030-01-01T12:00:00Z"),
          departLocation: "YXY",
          arriveAt: new Date("2030-01-01T14:00:00Z"),
          arriveLocation: "YVR",
          duration: "2h",
          status: "GK",
          class: "Y",
        })

        // Act
        const result = UpdateService.perform(invoice, {
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              travelDeskFlightSegmentId: segment.id,
              saleType: "Sale",
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toThrow(InvoiceValidationError)
      })

      test("when replacement items fail to persist, it rolls back the header and original items together", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({
          invoiceNumber: "KEEP-314",
          grossAmount: "10.125",
        })
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: air })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act
        await UpdateService.perform(invoice, {
          currencyCode: "CAD",
          invoiceNumber: "SHOULD-ROLL-BACK",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              passengerName: "A".repeat(256),
              saleType: "Sale",
              grossAmount: "12.001",
              position: 0,
            },
          ],
        }).catch(() => undefined)

        // Assert
        const invoices = await TravelDeskInvoice.findAll({ include: ["items"] })
        expect(invoices).toEqual([
          expect.objectContaining({
            invoiceNumber: "KEEP-314",
            grossAmount: "10.125",
            items: [
              expect.objectContaining({
                sourceAirSegmentNumber: 1,
                grossAmount: "10.125",
              }),
            ],
          }),
        ])
      })

      test("when replacement items cannot be stored, it propagates the persistence error", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create()

        // Act
        const result = UpdateService.perform(invoice, {
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              passengerName: "A".repeat(256),
              saleType: "Sale",
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toThrow()
      })

      test("when an item has malformed money, it preserves the invoice and its items", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.000" })
        await travelDeskInvoiceItemFactory.associations({ invoice, productType: air }).create({
          sourceAirSegmentNumber: 1,
          grossAmount: "10.000",
          saleType: "Sale",
          position: 0,
        })

        // Act
        await UpdateService.perform(invoice, {
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "not-money",
              position: 0,
            },
          ],
        }).catch(() => undefined)

        // Assert
        const invoices = await TravelDeskInvoice.findAll({ include: ["items"] })
        expect(invoices).toEqual([
          expect.objectContaining({
            grossAmount: "10.000",
            items: [
              expect.objectContaining({
                grossAmount: "10.000",
                sourceAirSegmentNumber: 1,
              }),
            ],
          }),
        ])
      })
    })
  })
})
