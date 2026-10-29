import { TravelDeskProductType, User } from "@/models"

import {
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
  userFactory,
} from "@/factories"

import DestroyService from "@/services/travel-desk-product-types/destroy-service"

describe("api/src/services/travel-desk-product-types/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe("#perform", () => {
      test("when a deleted invoice item references the product, it preserves the product type", async () => {
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

        // Act / Assert
        await expect(DestroyService.perform(productType, admin)).rejects.toThrow(
          "A product type used by an invoice cannot be deleted."
        )

        const persistedProductType = await TravelDeskProductType.findByPk(productType.id)
        expect(persistedProductType).toMatchObject({
          id: productType.id,
          code: "custom-fee",
          deletedAt: null,
        })
      })
    })
  })
})
