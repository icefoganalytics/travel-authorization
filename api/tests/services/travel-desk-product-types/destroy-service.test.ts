/// <reference lib="esnext.promise" />

import { QueryTypes } from "@sequelize/core"

import { db } from "@/db/db-client"
import { TravelDeskProductType, User } from "@/models"

import {
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
  userFactory,
} from "@/factories"

import DestroyService from "@/services/travel-desk-product-types/destroy-service"

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
        const { promise: productLocked, resolve: signalLocked } = Promise.withResolvers<void>()
        const { promise: allowInsert, resolve: insertInvoiceItem } = Promise.withResolvers<void>()
        const invoiceCreation = db.transaction(async (transaction) => {
          await TravelDeskProductType.findByPk(productType.id, {
            lock: transaction.LOCK.UPDATE,
            transaction,
          })
          signalLocked()
          await allowInsert
          await travelDeskInvoiceItemFactory.create({
            travelDeskProductTypeId: productType.id,
          })
        })
        await productLocked

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
          insertInvoiceItem()
          await invoiceCreation
          await deletion
        }

        // Assert
        const persistedProduct = await TravelDeskProductType.findByPk(productType.id)
        expect(persistedProduct).toMatchObject({
          id: productType.id,
          deletedAt: null,
        })
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
