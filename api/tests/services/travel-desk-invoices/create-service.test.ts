import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import CreateService from "@/services/travel-desk-invoices/create-service"

import {
  travelDeskBookingEventFactory,
  travelDeskTravelRequestFactory,
} from "@/factories"

describe("api/src/services/travel-desk-invoices/create-service.ts", () => {
  describe("CreateService", () => {
    describe(".perform", () => {
      test("when the selected booking is not cached, it rejects creation", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create()

        // Act
        const result = CreateService.perform(travelRequest, {
          bookingReference: "INV001",
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Choose a booking event with flight segments for this booking reference."
        )
      })

      test("when the selected booking belongs to another locator, it rejects creation", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          bookingReference: "OTHER1",
        })

        // Act
        const result = CreateService.perform(travelRequest, {
          bookingReference: "INV001",
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Choose a booking event with flight segments for this booking reference."
        )
      })

      test("when a selected fee is not cached, it rejects creation", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          bookingReference: "INV001",
          airReservationSegments: [
            {
              airSegmentNumber: 1,
              segmentStatus: "GK",
              carrierCode: null,
              boardPoint: "YXY",
              offPoint: "YVR",
              flightNumber: null,
              departureDate: null,
              departureTime: null,
              arrivalTime: null,
              changeOfDay: null,
            },
          ],
        })

        // Act
        const result = CreateService.perform(travelRequest, {
          bookingReference: "INV001",
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [920002],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Every selected service fee must belong to this booking reference."
        )
      })

      test("when a selected fee belongs to another locator, it rejects creation", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          bookingReference: "INV001",
          airReservationSegments: [
            {
              airSegmentNumber: 1,
              segmentStatus: "GK",
              carrierCode: null,
              boardPoint: "YXY",
              offPoint: "YVR",
              flightNumber: null,
              departureDate: null,
              departureTime: null,
              arrivalTime: null,
              changeOfDay: null,
            },
          ],
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920002,
          bookingReference: "OTHER1",
        })

        // Act
        const result = CreateService.perform(travelRequest, {
          bookingReference: "INV001",
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [920002],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Every selected service fee must belong to this booking reference."
        )
      })

      test("when cached booking and fee rows change, it retains the original invoice snapshot and staff pricing", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAll").mockRejectedValue(new Error("Source unavailable."))
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const bookingEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          bookingReference: "INV001",
          eventType: "B",
          bookingFileVersionNumber: 8,
          passengers: [
            {
              lastNameElement: 1,
              passengerElement: 1,
              firstName: "Ada",
              lastName: "Example",
            },
          ],
          airReservationSegments: [
            {
              airSegmentNumber: 1,
              segmentStatus: "GK",
              carrierCode: null,
              boardPoint: "YXY",
              offPoint: "YVR",
              flightNumber: null,
              departureDate: null,
              departureTime: null,
              arrivalTime: null,
              changeOfDay: null,
            },
            {
              airSegmentNumber: 2,
              segmentStatus: "GK",
              carrierCode: null,
              boardPoint: "YVR",
              offPoint: "YYJ",
              flightNumber: null,
              departureDate: null,
              departureTime: null,
              arrivalTime: null,
              changeOfDay: null,
            },
          ],
        })
        const feeEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920002,
          bookingReference: "INV001",
          eventType: "T",
          bookingFileVersionNumber: null,
          serviceFeeTransaction: {
            activeVoidStatus: "A",
            currencyCode: "CAD",
            serviceFeeAmount: "42.125",
            serviceFeeDocumentNumber: null,
            issueDate: null,
            commissionAmount: null,
            nameOnServiceFee: null,
            relatedTicketDocumentNumber: null,
            relatedInvoiceNumber: null,
          },
        })

        // Act
        await CreateService.perform(travelRequest, {
          bookingReference: " inv001 ",
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [920002],
          currencyCode: "CAD",
          items: [
            {
              productType: "air",
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "0.001",
              position: 0,
            },
            {
              productType: "air",
              sourceAirSegmentNumber: 2,
              saleType: "Sale",
              grossAmount: "0.002",
              position: 1,
            },
            {
              productType: "service_fee",
              sourceServiceFeeEventExternalIdentifier: 920002,
              saleType: "Sale",
              grossAmount: "42.125",
              position: 2,
            },
            {
              productType: "credit",
              saleType: "Refund",
              grossAmount: "0.003",
              position: 3,
            },
          ],
        })

        await bookingEvent.update({ passengers: [], bookingFileVersionNumber: 9 })
        await feeEvent.update({ serviceFeeTransaction: null })

        // Assert
        const invoices = await TravelDeskInvoice.findAll({
          include: [
            {
              association: "items",
              separate: true,
              order: [["position", "ASC"]],
            },
          ],
        })
        expect(invoices).toEqual([
          expect.objectContaining({
            travelDeskTravelRequestId: travelRequest.id,
            bookingReference: "INV001",
            externalBookingEventIdentifier: 920001,
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
            items: [
              expect.objectContaining({
                productType: "air",
                sourceAirSegmentNumber: 1,
                grossAmount: "0.001",
              }),
              expect.objectContaining({
                productType: "air",
                sourceAirSegmentNumber: 2,
                grossAmount: "0.002",
              }),
              expect.objectContaining({
                productType: "service_fee",
                sourceServiceFeeEventExternalIdentifier: 920002,
                grossAmount: "42.125",
              }),
              expect.objectContaining({
                productType: "credit",
                saleType: "Refund",
                grossAmount: "0.003",
              }),
            ],
          }),
        ])
      })

      test("when staff prices need rounding, it rounds each line before totaling", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          bookingReference: "INV001",
          airReservationSegments: [
            {
              airSegmentNumber: 1,
              segmentStatus: "GK",
              carrierCode: null,
              boardPoint: "YXY",
              offPoint: "YVR",
              flightNumber: null,
              departureDate: null,
              departureTime: null,
              arrivalTime: null,
              changeOfDay: null,
            },
            {
              airSegmentNumber: 2,
              segmentStatus: "GK",
              carrierCode: null,
              boardPoint: "YVR",
              offPoint: "YYJ",
              flightNumber: null,
              departureDate: null,
              departureTime: null,
              arrivalTime: null,
              changeOfDay: null,
            },
          ],
        })

        // Act
        await CreateService.perform(travelRequest, {
          bookingReference: "INV001",
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [
            {
              productType: "air",
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "0.0005",
              position: 0,
            },
            {
              productType: "air",
              sourceAirSegmentNumber: 2,
              saleType: "Sale",
              grossAmount: "0.0005",
              position: 1,
            },
          ],
        })

        // Assert
        const invoices = await TravelDeskInvoice.findAll({
          include: [
            {
              association: "items",
              separate: true,
              order: [["position", "ASC"]],
            },
          ],
        })
        expect(invoices).toEqual([
          expect.objectContaining({
            grossAmount: "0.002",
            items: [
              expect.objectContaining({
                sourceAirSegmentNumber: 1,
                grossAmount: "0.001",
              }),
              expect.objectContaining({
                sourceAirSegmentNumber: 2,
                grossAmount: "0.001",
              }),
            ],
          }),
        ])
      })

      test("when invoice items fail to persist, it rolls back the new invoice", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          bookingReference: "INV001",
          airReservationSegments: [
            {
              airSegmentNumber: 1,
              segmentStatus: "GK",
              carrierCode: null,
              boardPoint: "YXY",
              offPoint: "YVR",
              flightNumber: null,
              departureDate: null,
              departureTime: null,
              arrivalTime: null,
              changeOfDay: null,
            },
          ],
        })
        vi.spyOn(TravelDeskInvoiceItem, "bulkCreate").mockRejectedValue(
          new Error("Invoice items could not be stored.")
        )

        // Act
        await CreateService.perform(travelRequest, {
          bookingReference: "INV001",
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [
            {
              productType: "air",
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "10.125",
              position: 0,
            },
          ],
        }).catch(() => undefined)

        // Assert
        const invoices = await TravelDeskInvoice.findAll()
        expect(invoices).toEqual([])
      })
    })
  })
})
