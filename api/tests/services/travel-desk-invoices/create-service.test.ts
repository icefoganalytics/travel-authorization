import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import CreateService from "@/services/travel-desk-invoices/create-service"

import { travelDeskBookingEventFactory, travelDeskTravelRequestFactory } from "@/factories"

describe("api/src/services/travel-desk-invoices/create-service.ts", () => {
  describe("CreateService", () => {
    describe(".perform", () => {
      test("when the selected booking is not cached, it rejects creation", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()

        // Act
        const result = CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow("The selected booking event was not found.")
      })

      test("when the selected booking has no flight segments, it asks for a different event", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
        const travelDeskBookingEvent = await travelDeskBookingEventFactory.create({
          bookingReference: "INV001",
          airReservationSegments: [],
        })

        // Act
        const result = CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: travelDeskBookingEvent.externalTravelPortIdentifier,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "The selected booking event has no flight segments. Choose a different booking event."
        )
      })

      test("when the selected booking has no reference, it rejects creation", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          bookingReference: null,
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
        const result = CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "The selected booking event has no booking reference."
        )
      })

      test("when a selected fee is not cached, it rejects creation", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
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
        const result = CreateService.perform(travelDeskTravelRequest, {
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
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
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
          serviceFeeTransaction: {
            activeVoidStatus: "A",
            currencyCode: "CAD",
            serviceFeeAmount: "10.000",
            serviceFeeDocumentNumber: "FEE-314",
            issueDate: null,
            commissionAmount: null,
            nameOnServiceFee: null,
            relatedTicketDocumentNumber: null,
            relatedInvoiceNumber: null,
          },
        })

        // Act
        const result = CreateService.perform(travelDeskTravelRequest, {
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

      test("when a selected fee uses a different currency, it rejects creation", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
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
          bookingReference: "INV001",
          serviceFeeTransaction: {
            activeVoidStatus: "A",
            currencyCode: "USD",
            serviceFeeAmount: "10.000",
            serviceFeeDocumentNumber: "FEE-314",
            issueDate: null,
            commissionAmount: null,
            nameOnServiceFee: null,
            relatedTicketDocumentNumber: null,
            relatedInvoiceNumber: null,
          },
        })

        // Act
        const result = CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [920002],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Selected service fee currency must match the invoice currency."
        )
      })

      test("when two selected fees share a document number, it rejects creation", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
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
        for (const externalTravelPortIdentifier of [920002, 920003]) {
          await travelDeskBookingEventFactory.create({
            externalTravelPortIdentifier,
            bookingReference: "INV001",
            serviceFeeTransaction: {
              activeVoidStatus: "A",
              currencyCode: "CAD",
              serviceFeeAmount: "10.000",
              serviceFeeDocumentNumber: "FEE-314",
              issueDate: null,
              commissionAmount: null,
              nameOnServiceFee: null,
              relatedTicketDocumentNumber: null,
              relatedInvoiceNumber: null,
            },
          })
        }

        // Act
        const result = CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [920002, 920003],
          currencyCode: "CAD",
          items: [],
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Multiple versions of a service fee document cannot be selected."
        )
      })

      test("when cached booking and fee rows change, it retains invoice lines and staff pricing", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAll").mockRejectedValue(new Error("Source unavailable."))
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
        const travelDeskBookingEvent = await travelDeskBookingEventFactory.create({
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
        const serviceFeeTravelDeskBookingEvent = await travelDeskBookingEventFactory.create({
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
        await CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [920002],
          currencyCode: "CAD",
          items: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "0.001",
              position: 0,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 2,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "0.002",
              position: 1,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
              sourceServiceFeeEventExternalIdentifier: 920002,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "42.125",
              position: 2,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.CREDIT,
              saleType: TravelDeskInvoiceItem.SaleTypes.REFUND,
              grossAmount: "0.003",
              position: 3,
            },
          ],
        })

        await travelDeskBookingEvent.update({
          passengers: [],
          bookingFileVersionNumber: 9,
        })
        await serviceFeeTravelDeskBookingEvent.update({
          serviceFeeTransaction: null,
        })

        // Assert
        const travelDeskInvoices = await TravelDeskInvoice.findAll({
          include: [
            {
              association: "items",
              separate: true,
              order: [["position", "ASC"]],
            },
          ],
        })
        expect(travelDeskInvoices).toEqual([
          expect.objectContaining({
            travelDeskTravelRequestId: travelDeskTravelRequest.id,
            bookingReference: "INV001",
            externalBookingEventIdentifier: 920001,
            grossAmount: "42.125",
            items: [
              expect.objectContaining({
                productType: TravelDeskInvoiceItem.ProductTypes.AIR,
                sourceAirSegmentNumber: 1,
                grossAmount: "0.001",
              }),
              expect.objectContaining({
                productType: TravelDeskInvoiceItem.ProductTypes.AIR,
                sourceAirSegmentNumber: 2,
                grossAmount: "0.002",
              }),
              expect.objectContaining({
                productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
                sourceServiceFeeEventExternalIdentifier: 920002,
                grossAmount: "42.125",
              }),
              expect.objectContaining({
                productType: TravelDeskInvoiceItem.ProductTypes.CREDIT,
                saleType: TravelDeskInvoiceItem.SaleTypes.REFUND,
                grossAmount: "0.003",
              }),
            ],
          }),
        ])
      })

      test("when staff prices need rounding, it rounds each line before totaling", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
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
        await CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "0.0005",
              position: 0,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 2,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "0.0005",
              position: 1,
            },
          ],
        })

        // Assert
        const travelDeskInvoices = await TravelDeskInvoice.findAll({
          include: [
            {
              association: "items",
              separate: true,
              order: [["position", "ASC"]],
            },
          ],
        })
        expect(travelDeskInvoices).toEqual([
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

      test("when item storage fails after inserting rows, it rolls back the new invoice", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
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
        const persistenceError = new Error("Invoice items could not be stored.")
        const bulkCreateTravelDeskInvoiceItems = TravelDeskInvoiceItem.bulkCreate
        vi.spyOn(TravelDeskInvoiceItem, "bulkCreate").mockImplementationOnce(
          async (travelDeskInvoiceItemAttributes, options) => {
            await bulkCreateTravelDeskInvoiceItems.call(
              TravelDeskInvoiceItem,
              travelDeskInvoiceItemAttributes,
              options
            )
            throw persistenceError
          }
        )

        // Act
        const result = CreateService.perform(travelDeskTravelRequest, {
          externalBookingEventIdentifier: 920001,
          sourceServiceFeeEventExternalIdentifiers: [],
          currencyCode: "CAD",
          items: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "10.125",
              position: 0,
            },
          ],
        })
        await result.then(
          () => {
            throw new Error("Expected invoice item persistence to fail.")
          },
          (error: unknown) => {
            if (error !== persistenceError) throw error
          }
        )

        // Assert
        const travelDeskInvoices = await TravelDeskInvoice.findAll()
        expect(travelDeskInvoices).toEqual([])
      })
    })
  })
})
