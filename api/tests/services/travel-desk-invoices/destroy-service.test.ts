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
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({ grossAmount: "1.000" })
        await travelDeskInvoiceItemFactory.associations({ invoice: travelDeskInvoice }).create({
          sourceAirSegmentNumber: 1,
          grossAmount: "1.000",
        })
        const { promise: travelDeskInvoiceEdited, resolve: signalEdited } =
          Promise.withResolvers<void>()
        const { promise: commitAllowed, resolve: allowCommit } = Promise.withResolvers<void>()
        const edit = db.transaction(async () => {
          await UpdateService.perform(travelDeskInvoice, {
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
        const editReady = Promise.race([travelDeskInvoiceEdited, edit])

        // Act
        const deletion = editReady.then(() => DestroyService.perform(travelDeskInvoice))
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
          await completion
        }
        await Promise.all([edit, deletion])

        // Assert
        const travelDeskInvoiceItems = await TravelDeskInvoiceItem.findAll({
          paranoid: false,
          order: [
            ["position", "ASC"],
            ["id", "ASC"],
          ],
        })
        expect(travelDeskInvoiceItems).toEqual([
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
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        const travelDeskInvoiceItem = await travelDeskInvoiceItemFactory
          .associations({
            invoice: travelDeskInvoice,
          })
          .create()

        // Act
        await DestroyService.perform(travelDeskInvoice)

        // Assert
        const travelDeskInvoices = await TravelDeskInvoice.findAll({
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
        expect(travelDeskInvoices).toEqual([
          expect.objectContaining({
            id: travelDeskInvoice.id,
            deletedAt: expect.any(Date),
            items: [
              expect.objectContaining({
                id: travelDeskInvoiceItem.id,
                deletedAt: expect.any(Date),
              }),
            ],
          }),
        ])
      })

      test("when deleting the invoice fails, it rolls back deletion of its lines", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        const travelDeskInvoiceItem = await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create()
        const persistenceError = new Error("Invoice deletion failed.")
        vi.spyOn(travelDeskInvoice, "destroy").mockRejectedValue(persistenceError)

        // Act
        try {
          await DestroyService.perform(travelDeskInvoice)
          throw new Error("Expected invoice deletion to fail.")
        } catch (error) {
          if (error !== persistenceError) {
            throw error
          }
        }

        // Assert
        const travelDeskInvoiceItems = await TravelDeskInvoiceItem.findAll()
        expect(travelDeskInvoiceItems).toEqual([
          expect.objectContaining({
            id: travelDeskInvoiceItem.id,
            deletedAt: null,
          }),
        ])
      })
    })
  })
})
