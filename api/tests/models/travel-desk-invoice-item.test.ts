import { TravelDeskInvoiceItem } from "@/models"

import { travelDeskInvoiceItemFactory } from "@/factories"

describe("api/src/models/travel-desk-invoice-item.ts", () => {
  describe("TravelDeskInvoiceItem", () => {
    describe("validations - sourceMatchesProductType", () => {
      test("an airfare line can identify the flight segment it pays for", async () => {
        // Arrange
        const item = travelDeskInvoiceItemFactory.build({
          travelDeskInvoiceId: 1,
          productType: TravelDeskInvoiceItem.ProductTypes.AIR,
          sourceAirSegmentNumber: 1,
        })

        // Act
        const validation = item.validate()

        // Assert
        await expect(validation).resolves.not.toThrow()
      })

      test.each([
        TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
        TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
        TravelDeskInvoiceItem.ProductTypes.CREDIT,
      ])("a %s line cannot identify a flight segment as the charge being billed", async (productType) => {
        // Arrange
        const item = travelDeskInvoiceItemFactory.build({
          travelDeskInvoiceId: 1,
          productType,
          sourceAirSegmentNumber: 1,
        })

        // Act
        const validation = item.validate()

        // Assert
        await expect(validation).rejects.toThrow("Only air items can refer to a source flight segment.")
      })

      test("a service fee line can identify the booking fee it bills", async () => {
        // Arrange
        const item = travelDeskInvoiceItemFactory.build({
          travelDeskInvoiceId: 1,
          productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
          sourceServiceFeeEventExternalIdentifier: 920002,
        })

        // Act
        const validation = item.validate()

        // Assert
        await expect(validation).resolves.not.toThrow()
      })

      test.each([
        TravelDeskInvoiceItem.ProductTypes.AIR,
        TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
        TravelDeskInvoiceItem.ProductTypes.CREDIT,
      ])("a %s line cannot identify a booking service fee as the charge being billed", async (productType) => {
        // Arrange
        const item = travelDeskInvoiceItemFactory.build({
          travelDeskInvoiceId: 1,
          productType,
          sourceServiceFeeEventExternalIdentifier: 920002,
        })

        // Act
        const validation = item.validate()

        // Assert
        await expect(validation).rejects.toThrow("Only service fee items can refer to a source service fee.")
      })
    })
  })
})
