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
