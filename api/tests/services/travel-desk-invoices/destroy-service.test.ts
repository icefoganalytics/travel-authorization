/// <reference lib="esnext.promise" />

import { QueryTypes } from "@sequelize/core"

import { db } from "@/db/db-client"
import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"
import DestroyService from "@/services/travel-desk-invoices/destroy-service"
import { UpdateService } from "@/services/travel-desk-invoices/update-service"

import {
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
} from "@/factories"

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
        const { promise: allowCommit, resolve: commitEdit } = Promise.withResolvers<void>()
        const edit = db.transaction(async () => {
          await UpdateService.perform(invoice, {
            currencyCode: "CAD",
            items: [
              {
                productType: "air",
                sourceAirSegmentNumber: 1,
                saleType: "sale",
                grossAmount: "2.000",
                position: 0,
              },
            ],
          })
          signalEdited()
          await allowCommit
        })
        await invoiceEdited

        // Act
        const deletion = DestroyService.perform(invoice)
        try {
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
          commitEdit()
          await edit
          await deletion
        }

        // Assert
        const activeItems = await TravelDeskInvoiceItem.findAll()
        expect(activeItems).toEqual([])
      })

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

      test("when deleting the invoice fails, it leaves its lines active", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()
        const item = await travelDeskInvoiceItemFactory
          .associations({
            invoice,
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
