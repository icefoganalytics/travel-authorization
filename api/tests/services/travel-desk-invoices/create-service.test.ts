import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { TravelDeskInvoice } from "@/models"

import CreateService from "@/services/travel-desk-invoices/create-service"

import {
  travelDeskBookingEventFactory,
  travelDeskProductTypeFactory,
  travelDeskTravelRequestFactory,
} from "@/factories"

describe("api/src/services/travel-desk-invoices/create-service.ts", () => {
  describe("CreateService", () => {
    describe(".perform", () => {
      test.each([null, "OTHER1"])(
        "when the request link is %s, it rejects another booking before reading cached events",
        async (travelportRecordLocator) => {
          // Arrange
          const travelRequest = await travelDeskTravelRequestFactory.create({
            travelportRecordLocator,
          })
          const message =
            travelportRecordLocator === null
              ? "Link a Travelport booking to this travel request first."
              : "Invoice booking must match the linked Travelport booking."

          // Act
          const result = CreateService.perform(travelRequest, {
            recordLocator: "INV001",
            sourceBookingEventId: 920001,
            sourceServiceFeeEventIds: [],
            currencyCode: "CAD",
            items: [],
          })

          // Assert
          await expect(result).rejects.toThrow(message)
        }
      )

      test.each([null, "OTHER1"])(
        "when the selected booking is not cached for this locator (%s), it rejects creation",
        async (cachedLocator) => {
          // Arrange
          const travelRequest = await travelDeskTravelRequestFactory.create({
            travelportRecordLocator: "INV001",
          })
          if (cachedLocator !== null) {
            await travelDeskBookingEventFactory.create({
              externalTravelPortIdentifier: 920001,
              recordLocator: cachedLocator,
            })
          }

          // Act
          const result = CreateService.perform(travelRequest, {
            recordLocator: "INV001",
            sourceBookingEventId: 920001,
            sourceServiceFeeEventIds: [],
            currencyCode: "CAD",
            items: [],
          })

          // Assert
          await expect(result).rejects.toThrow(
            "Choose a booking event with flight segments for this locator."
          )
        }
      )

      test.each([null, "OTHER1"])(
        "when a selected fee is not cached for this locator (%s), it rejects creation",
        async (cachedLocator) => {
          // Arrange
          const travelRequest = await travelDeskTravelRequestFactory.create({
            travelportRecordLocator: "INV001",
          })
          await travelDeskBookingEventFactory.create({
            externalTravelPortIdentifier: 920001,
            recordLocator: "INV001",
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
          if (cachedLocator !== null) {
            await travelDeskBookingEventFactory.create({
              externalTravelPortIdentifier: 920002,
              recordLocator: cachedLocator,
            })
          }

          // Act
          const result = CreateService.perform(travelRequest, {
            recordLocator: "INV001",
            sourceBookingEventId: 920001,
            sourceServiceFeeEventIds: [920002],
            currencyCode: "CAD",
            items: [],
          })

          // Assert
          await expect(result).rejects.toThrow(
            "Every selected service fee must belong to this locator."
          )
        }
      )

      test("when cached booking and fee rows change, it retains the original invoice snapshot and staff pricing", async () => {
        // Arrange
        vi.spyOn(TravelOrderEvent, "findAll").mockRejectedValue(new Error("Source unavailable."))
        const travelRequest = await travelDeskTravelRequestFactory.create({
          travelportRecordLocator: "INV001",
        })
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const fee = await travelDeskProductTypeFactory.create({
          code: "service-fee",
          name: "Service Fee",
        })
        const credit = await travelDeskProductTypeFactory.create({ code: "credit", name: "Credit" })
        const bookingEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 920001,
          recordLocator: "INV001",
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
          recordLocator: "INV001",
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
          recordLocator: " inv001 ",
          sourceBookingEventId: 920001,
          sourceServiceFeeEventIds: [920002],
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "0.0005",
              position: 0,
            },
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 2,
              saleType: "Sale",
              grossAmount: "0.0015",
              position: 1,
            },
            {
              travelDeskProductTypeId: fee.id,
              sourceServiceFeeEventId: 920002,
              saleType: "Sale",
              grossAmount: "42.125000000001",
              position: 2,
            },
            {
              travelDeskProductTypeId: credit.id,
              saleType: "Refund",
              grossAmount: "0.0025",
              position: 3,
            },
          ],
        })

        await bookingEvent.update({ passengers: [], bookingFileVersionNumber: 9 })
        await feeEvent.update({ serviceFeeTransaction: null })
        await travelRequest.update({ travelportRecordLocator: "OTHER1" })
        await travelRequest.update({ travelportRecordLocator: null })

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
            items: [
              expect.objectContaining({ sourceAirSegmentNumber: 1, grossAmount: "0.001" }),
              expect.objectContaining({ sourceAirSegmentNumber: 2, grossAmount: "0.002" }),
              expect.objectContaining({ sourceServiceFeeEventId: 920002, grossAmount: "42.125" }),
              expect.objectContaining({ saleType: "Refund", grossAmount: "0.003" }),
            ],
          }),
        ])
      })
    })
  })
})
