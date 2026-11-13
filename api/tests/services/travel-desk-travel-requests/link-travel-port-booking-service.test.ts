import { BookingsService } from "@/integrations/travel-port-integration/services/bookings-service"
import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import LinkTravelPortBookingService from "@/services/travel-desk-travel-requests/link-travel-port-booking-service"
import UpdateService from "@/services/travel-desk-invoices/update-service"

import {
  travelDeskInvoiceFactory,
  travelDeskProductTypeFactory,
  travelDeskTravelRequestFactory,
} from "@/factories"

describe("api/src/services/travel-desk-travel-requests/link-travel-port-booking-service.ts", () => {
  describe("LinkTravelPortBookingService", () => {
    describe(".perform", () => {
      test("when a real booking replaces an existing link, it persists the canonical locator without changing legacy data", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create({
          travelPortRecordLocator: "OLD001",
          invoiceNumber: "TRAVCOM-314",
        })
        vi.spyOn(BookingsService, "perform").mockResolvedValue({
          travelPortBookings: [{ recordLocator: "NEW001" }],
          totalCount: 1,
        })

        // Act
        await LinkTravelPortBookingService.perform(travelRequest, " new001 ")

        // Assert
        const requests = await TravelDeskTravelRequest.findAll()
        expect(requests).toEqual([
          expect.objectContaining({
            travelPortRecordLocator: "NEW001",
            invoiceNumber: "TRAVCOM-314",
          }),
        ])
      })

      test("when clearing a link during a source outage, it clears without consulting the source", async () => {
        // Arrange
        const travelRequest = await travelDeskTravelRequestFactory.create({
          travelPortRecordLocator: "OLD001",
        })
        vi.spyOn(BookingsService, "perform").mockRejectedValue(
          new SourceUnavailableError("Offline.")
        )

        // Act
        await LinkTravelPortBookingService.perform(travelRequest, null)

        // Assert
        const requests = await TravelDeskTravelRequest.findAll()
        expect(requests).toEqual([expect.objectContaining({ travelPortRecordLocator: null })])
      })

      test.each(["missing", "unavailable"])(
        "when the selected source is %s, it preserves the existing link",
        async (condition) => {
          // Arrange
          const travelRequest = await travelDeskTravelRequestFactory.create({
            travelPortRecordLocator: "OLD001",
          })
          const lookup = vi.spyOn(BookingsService, "perform")
          if (condition === "missing") {
            lookup.mockResolvedValue({ travelPortBookings: [], totalCount: 0 })
          } else {
            lookup.mockRejectedValue(new SourceUnavailableError("Offline."))
          }

          // Act
          await LinkTravelPortBookingService.perform(travelRequest, "NEW001").catch(() => undefined)

          // Assert
          const requests = await TravelDeskTravelRequest.findAll()
          expect(requests).toEqual([expect.objectContaining({ travelPortRecordLocator: "OLD001" })])
        }
      )

      test.each(["NEW001", null])(
        "when the link becomes %s, it preserves saved invoice snapshots and allows pricing edits",
        async (recordLocator) => {
          // Arrange
          const travelRequest = await travelDeskTravelRequestFactory.create({
            travelPortRecordLocator: "OLD001",
          })
          const invoice = await travelDeskInvoiceFactory
            .associations({ travelDeskTravelRequest: travelRequest })
            .create({ recordLocator: "OLD001" })
          const savedSnapshot = invoice.sourceSnapshot
          const productType = await travelDeskProductTypeFactory.create({
            code: "air",
            name: "Air",
          })
          vi.spyOn(BookingsService, "perform").mockResolvedValue({
            travelPortBookings: [{ recordLocator: "NEW001" }],
            totalCount: 1,
          })

          // Act
          await LinkTravelPortBookingService.perform(travelRequest, recordLocator)
          await UpdateService.perform(invoice, {
            currencyCode: "CAD",
            items: [
              {
                travelDeskProductTypeId: productType.id,
                sourceAirSegmentNumber: 1,
                saleType: "Sale",
                grossAmount: "12.001",
                position: 0,
              },
            ],
          })

          // Assert
          const invoices = await TravelDeskInvoice.findAll({ include: ["items"] })
          expect(invoices).toEqual([
            expect.objectContaining({
              recordLocator: "OLD001",
              sourceSnapshot: savedSnapshot,
              grossAmount: "12.001",
              items: [
                expect.objectContaining({ grossAmount: "12.001", sourceAirSegmentNumber: 1 }),
              ],
            }),
          ])
        }
      )
    })
  })
})
