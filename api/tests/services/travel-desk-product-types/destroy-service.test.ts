/// <reference lib="esnext.promise" />

import { QueryTypes } from "@sequelize/core"

import { db } from "@/db/db-client"
import { TravelDeskProductType, User } from "@/models"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { UpdateService } from "@/services/travel-desk-invoices/update-service"
import DestroyService from "@/services/travel-desk-product-types/destroy-service"

import {
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-desk-product-types/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe(".perform", () => {
      test("when an invoice commits while deletion waits, it preserves the referenced product", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create({
          code: "custom-fee",
          name: "Custom Fee",
        })
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create()
        const { promise: invoiceSaved, resolve: signalSaved } = Promise.withResolvers<void>()
        const { promise: allowCommit, resolve: commitInvoice } = Promise.withResolvers<void>()
        const invoiceUpdate = db.transaction(async () => {
          await UpdateService.perform(invoice, {
            currencyCode: "CAD",
            items: [
              {
                travelDeskProductTypeId: air.id,
                sourceAirSegmentNumber: 1,
                saleType: "Sale",
                grossAmount: "1.000",
                position: 0,
              },
              {
                travelDeskProductTypeId: productType.id,
                saleType: "Sale",
                grossAmount: "1.000",
                position: 1,
              },
            ],
          })
          signalSaved()
          await allowCommit
        })
        await invoiceSaved

        // Act
        const deletion = DestroyService.perform(productType, admin).catch((error) => error)
        try {
          await vi.waitFor(
            async () => {
              const waitingDeletions = await db.query(
                `SELECT pid FROM pg_stat_activity
                 WHERE datname = current_database()
                   AND state = 'active'
                   AND wait_event_type = 'Lock'
                   AND query LIKE '%travel_desk_product_types%'`,
                { type: QueryTypes.SELECT }
              )
              if (waitingDeletions.length !== 1) {
                throw new Error("Waiting for product deletion to reach the locked row.")
              }
            },
            { timeout: 5000 }
          )
        } finally {
          commitInvoice()
          await invoiceUpdate
          await deletion
        }

        // Assert
        const persistedProduct = await TravelDeskProductType.findByPk(productType.id)
        expect(persistedProduct).toMatchObject({
          id: productType.id,
          deletedAt: null,
        })
      })

      test("when product deletion wins, it rejects an invoice edit using that product", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create({
          code: "custom-fee",
          name: "Custom Fee",
        })
        const air = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        const invoice = await travelDeskInvoiceFactory.create()
        const { promise: productDeleted, resolve: signalDeleted } = Promise.withResolvers<void>()
        const { promise: allowCommit, resolve: commitDeletion } = Promise.withResolvers<void>()
        const deletion = db.transaction(async () => {
          await DestroyService.perform(productType, admin)
          signalDeleted()
          await allowCommit
        })
        await productDeleted

        // Act
        const update = UpdateService.perform(invoice, {
          currencyCode: "CAD",
          items: [
            {
              travelDeskProductTypeId: air.id,
              sourceAirSegmentNumber: 1,
              saleType: "Sale",
              grossAmount: "1.000",
              position: 0,
            },
            {
              travelDeskProductTypeId: productType.id,
              saleType: "Sale",
              grossAmount: "1.000",
              position: 1,
            },
          ],
        }).catch((error) => error)
        try {
          await vi.waitFor(
            async () => {
              const waitingUpdates = await db.query(
                `SELECT pid FROM pg_stat_activity
                 WHERE datname = current_database()
                   AND state = 'active'
                   AND wait_event_type = 'Lock'
                   AND query LIKE '%travel_desk_%'`,
                { type: QueryTypes.SELECT }
              )
              if (waitingUpdates.length !== 1) {
                throw new Error("Waiting for the invoice edit to reach the deleted product.")
              }
            },
            { timeout: 5000 }
          )
        } finally {
          commitDeletion()
          await deletion
        }

        // Assert
        await expect(update).resolves.toEqual(
          new InvoiceValidationError("Every invoice item must use an active product type.")
        )
      })

      test("when a deleted invoice item references the product, it rejects deletion", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create({
          code: "custom-fee",
          name: "Custom Fee",
        })
        const invoiceItem = await travelDeskInvoiceItemFactory.create({
          travelDeskProductTypeId: productType.id,
        })
        await invoiceItem.destroy()

        // Act
        const result = DestroyService.perform(productType, admin)

        // Assert
        await expect(result).rejects.toThrow("A product type used by an invoice cannot be deleted.")
      })

      test("when invoice history references the product, it leaves the product type active", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create({
          code: "custom-fee",
          name: "Custom Fee",
        })
        const invoiceItem = await travelDeskInvoiceItemFactory.create({
          travelDeskProductTypeId: productType.id,
        })
        await invoiceItem.destroy()

        // Act
        await DestroyService.perform(productType, admin).catch(() => undefined)

        // Assert
        const productTypes = await TravelDeskProductType.findAll()
        expect(productTypes).toEqual([
          expect.objectContaining({
            id: productType.id,
            code: "custom-fee",
            deletedAt: null,
          }),
        ])
      })
    })
  })
})
