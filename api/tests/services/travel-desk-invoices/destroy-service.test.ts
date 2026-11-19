/// <reference lib="esnext.promise" />

import { QueryTypes } from "@sequelize/core"

import { db } from "@/db/db-client"
import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"
import DestroyService from "@/services/travel-desk-invoices/destroy-service"
import { UpdateService } from "@/services/travel-desk-invoices/update-service"

import { travelDeskInvoiceFactory, travelDeskInvoiceItemFactory } from "@/factories"

describe("api/src/services/travel-desk-invoices/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe(".perform", () => {
      test("when deletion overlaps an invoice edit, it also deletes the replacement lines", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create({ grossAmount: "1.000" })
        await travelDeskInvoiceItemFactory.associations({ invoice }).create({
          sourceAirSegmentNumber: 1,
          grossAmount: "1.000",
        })
        const { promise: invoiceEdited, resolve: signalEdited } = Promise.withResolvers<void>()
        const { promise: commitAllowed, resolve: allowCommit } = Promise.withResolvers<void>()
        const edit = db.transaction(async () => {
          await UpdateService.perform(invoice, {
            currencyCode: "CAD",
            items: [
              {
                productType: TravelDeskInvoiceItem.ProductTypes.AIR,
                sourceAirSegmentNumber: 1,
                saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
                grossAmount: "2.000",
                position: 0,
              },
            ],
          })
          signalEdited()
          await commitAllowed
        })
        const editReady = Promise.race([invoiceEdited, edit])

        // Act
        const deletion = editReady.then(() => DestroyService.perform(invoice))
        const completion = Promise.allSettled([edit, deletion])
        try {
          await editReady
          await vi.waitFor(
            async () => {
              const waitingDeletions = await db.query(
                `SELECT pid FROM pg_stat_activity
                 WHERE datname = current_database()
                   AND state = 'active'
                   AND wait_event_type = 'Lock'
                   AND query LIKE '%travel_desk_invoice%'`,
                { type: QueryTypes.SELECT }
              )
              if (waitingDeletions.length !== 1) {
                throw new Error("Waiting for invoice deletion to reach the pending edit.")
              }
            },
            { timeout: 5000 }
          )
        } finally {
          allowCommit()
          const outcomes = await completion
          for (const outcome of outcomes) {
            if (outcome.status === "rejected") {
              throw outcome.reason
            }
          }
        }

        // Assert
        const items = await TravelDeskInvoiceItem.findAll({
          paranoid: false,
          order: [
            ["position", "ASC"],
            ["id", "ASC"],
          ],
        })
        expect(items).toEqual([
          expect.objectContaining({
            grossAmount: "1.000",
            deletedAt: expect.any(Date),
          }),
          expect.objectContaining({
            grossAmount: "2.000",
            deletedAt: expect.any(Date),
          }),
        ])
      }, 10_000)

      test("when an invoice is deleted, it soft-deletes the invoice and its lines", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()
        const item = await travelDeskInvoiceItemFactory
          .associations({
            invoice,
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
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(invoices).toEqual([
          expect.objectContaining({
            id: invoice.id,
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

      test("when deleting the invoice fails, it propagates the error and rolls back deletion of its lines", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()
        const item = await travelDeskInvoiceItemFactory.associations({ invoice }).create()
        const persistenceError = new Error("Invoice deletion failed.")
        vi.spyOn(invoice, "destroy").mockRejectedValue(persistenceError)

        // Act
        const result = DestroyService.perform(invoice)

        // Assert
        await expect(result).rejects.toBe(persistenceError)
        const items = await TravelDeskInvoiceItem.findAll()
        expect(items).toEqual([
          expect.objectContaining({
            id: item.id,
            deletedAt: null,
          }),
        ])
      })
    })
  })
})
