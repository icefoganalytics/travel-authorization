import {
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  TravelDeskInvoice,
} from "@/models"
import sourceDatabase from "@/integrations/travelport-integration/db/db-migration-client"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"

import {
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import SaveService from "@/services/travel-desk-invoices/save-service"

describe("api/src/services/travel-desk-invoices/save-service.ts", () => {
  describe("SaveService", () => {
    describe(".create", () => {
      beforeEach(async () => {
        await sourceDatabase("Passenger").del()
        await sourceDatabase("AirRsrvSeg").del()
        await sourceDatabase("SFTrans").del()
        await sourceDatabase("TravelOrderEvent").del()
      })

      test("when a booking and a separate fee are selected, it persists their provenance and exact total", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const fee = await travelDeskProductTypeFactory.create({
          code: "service-fee",
          name: "Service Fee",
        })
        const credit = await travelDeskProductTypeFactory.create({ code: "credit", name: "Credit" })
        await sourceDatabase("TravelOrderEvent").insert([
          {
            TravelOrderIdentifier: 920001,
            RecordLocator: "INV001",
            EventType: "B",
            PnrBfVersionNbr: 8,
            DatabaseTimeStamp: "2030-01-01T12:00:00",
          },
          {
            TravelOrderIdentifier: 920002,
            RecordLocator: "INV001",
            EventType: "T",
            PnrBfVersionNbr: null,
            DatabaseTimeStamp: "2030-01-02T12:00:00",
          },
        ])
        await sourceDatabase("Passenger").insert({
          TravelOrderIdentifier: 920001,
          LastNameElement: 1,
          PassengerElement: 1,
          FirstName: "Ada",
          LastName: "Example",
        })
        await sourceDatabase("AirRsrvSeg").insert([
          {
            TravelOrderIdentifier: 920001,
            AirSegmentNbr: 1,
            SegmentStatus: "GK",
            BoardPoint: "YXY",
            OffPoint: "YVR",
          },
          {
            TravelOrderIdentifier: 920001,
            AirSegmentNbr: 2,
            SegmentStatus: "GK",
            BoardPoint: "YVR",
            OffPoint: "YYJ",
          },
        ])
        await sourceDatabase("SFTrans").insert({
          TravelOrderIdentifier: 920002,
          SFActiveVoidStatus: "A",
          SFCurrencyCode: "CAD",
          ServiceFeeAmount: "42.125",
        })

        // Act
        await SaveService.create({
          travelDeskTravelRequestId: travelRequest.id,
          recordLocator: " inv001 ",
          sourceBookingEventId: 920001,
          sourceServiceFeeEventIds: [920002],
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "0.001",
              position: 0,
            },
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 2,
              saleType: "Sale",
              grossAmount: "0.002",
              position: 1,
            },
            {
              travelDeskProductTypeId: fee.id,
              sourceServiceFeeEventId: 920002,
              saleType: "Sale",
              grossAmount: "42.125",
              position: 2,
            },
            {
              travelDeskProductTypeId: credit.id,
              saleType: "Refund",
              grossAmount: "0.003",
              position: 3,
            },
          ],
        })

        // Assert
        const invoices = await TravelDeskInvoice.findAll({ include: ["items"] })
        expect(invoices).toEqual([
          expect.objectContaining({
            travelDeskTravelRequestId: travelRequest.id,
            recordLocator: "INV001",
            sourceBookingEventId: 920001,
            grossAmount: "42.125",
            sourceSnapshot: expect.objectContaining({
              bookingEvent: expect.objectContaining({
                travelOrderIdentifier: 920001,
                bookingFileVersionNumber: 8,
                passengers: [
                  {
                    lastNameElement: 1,
                    passengerElement: 1,
                    firstName: "Ada",
                    lastName: "Example",
                  },
                ],
              }),
              serviceFeeEvents: [
                expect.objectContaining({
                  travelOrderIdentifier: 920002,
                  bookingFileVersionNumber: null,
                  serviceFeeTransaction: expect.objectContaining({
                    serviceFeeAmount: "42.125",
                    currencyCode: "CAD",
                  }),
                }),
              ],
            }),
            items: expect.arrayContaining([
              expect.objectContaining({ sourceAirSegmentNumber: 1, grossAmount: "0.001" }),
              expect.objectContaining({ sourceAirSegmentNumber: 2, grossAmount: "0.002" }),
              expect.objectContaining({ sourceServiceFeeEventId: 920002, grossAmount: "42.125" }),
              expect.objectContaining({ saleType: "Refund", grossAmount: "0.003" }),
            ]),
          }),
        ])
      })
    })

    describe(".update", () => {
      test("when no source rows are available, it edits from the saved snapshot and preserves omitted headers", async () => {
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
        await SaveService.update(invoice, {
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

      test("when a source segment identity is replaced, it rejects the forged identity", async () => {
        // Arrange
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.125" })
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: air })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act / Assert
        await expect(
          SaveService.update(invoice, {
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
        ).rejects.toThrow(InvoiceValidationError)
        const persistedInvoice = await TravelDeskInvoice.findByPk(invoice.id, {
          include: ["items"],
        })
        expect(persistedInvoice).toMatchObject({
          grossAmount: "10.125",
          items: [{ sourceAirSegmentNumber: 1, grossAmount: "10.125" }],
        })
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

        // Act / Assert
        await expect(
          SaveService.update(invoice, {
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
        ).rejects.toThrow(InvoiceValidationError)
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

        // Act / Assert
        await expect(
          SaveService.update(invoice, {
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
          })
        ).rejects.toThrow()
        const persistedInvoice = await TravelDeskInvoice.findByPk(invoice.id, {
          include: ["items"],
        })
        expect(persistedInvoice).toMatchObject({
          invoiceNumber: "KEEP-314",
          grossAmount: "10.125",
          items: [{ sourceAirSegmentNumber: 1, grossAmount: "10.125" }],
        })
      })
    })
  })
})
