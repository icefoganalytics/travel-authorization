import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"
import DestroyService from "@/services/travel-desk-invoices/destroy-service"

import {
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
} from "@/factories"

describe("api/src/services/travel-desk-invoices/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe(".perform", () => {
      test("when an invoice is deleted, it retains the source snapshot and soft-deletes its lines", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()
        const sourceSnapshot = invoice.sourceSnapshot
        const productType = await travelDeskProductTypeFactory.create()
        const item = await travelDeskInvoiceItemFactory
          .associations({
            invoice,
            productType,
          })
          .create()

        // Act
        await DestroyService.perform(invoice)

        // Assert
        const invoices = await TravelDeskInvoice.findAll({
          paranoid: false,
          include: [
            {
              association: "items",
              paranoid: false,
            },
          ],
        })
        expect(invoices).toEqual([
          expect.objectContaining({
            id: invoice.id,
            sourceSnapshot,
            deletedAt: expect.any(Date),
            items: [
              expect.objectContaining({
                id: item.id,
                deletedAt: expect.any(Date),
              }),
            ],
          }),
        ])
      })

      test("when deleting the invoice fails, it leaves its lines active", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()
        const productType = await travelDeskProductTypeFactory.create()
        const item = await travelDeskInvoiceItemFactory
          .associations({
            invoice,
            productType,
          })
          .create()
        vi.spyOn(invoice, "destroy").mockRejectedValue(new Error("Invoice deletion failed."))

        // Act
        await DestroyService.perform(invoice).catch(() => undefined)

        // Assert
        const items = await TravelDeskInvoiceItem.findAll()
        expect(items).toEqual([
          expect.objectContaining({
            id: item.id,
            deletedAt: null,
          }),
        ])
      })

      test("when deleting the invoice fails, it propagates the persistence error", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()
        vi.spyOn(invoice, "destroy").mockRejectedValue(new Error("Invoice deletion failed."))

        // Act
        const result = DestroyService.perform(invoice)

        // Assert
        await expect(result).rejects.toThrow("Invoice deletion failed.")
      })
    })
  })
})
