import { TravelDeskInvoiceItem } from "@/models"

import { travelDeskInvoiceItemFactory } from "@/factories"

describe("api/src/models/travel-desk-invoice-item.ts", () => {
  describe("TravelDeskInvoiceItem", () => {
    describe("validations - sourceMatchesProductType", () => {
      test("when billing airfare, the line can identify the flight segment it pays for", async () => {
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
      ])("when billing %s, the line cannot claim a flight segment as airfare", async (productType) => {
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

      test("when billing a service fee, the line can identify the booking fee it pays for", async () => {
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
      ])("when billing %s, the line cannot claim a booking service fee as its charge", async (productType) => {
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
