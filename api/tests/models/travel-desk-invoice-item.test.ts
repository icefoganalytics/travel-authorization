import { TravelDeskInvoiceItem } from "@/models"

import { travelDeskInvoiceItemFactory } from "@/factories"

describe("api/src/models/travel-desk-invoice-item.ts", () => {
  describe("TravelDeskInvoiceItem", () => {
    describe("validations - sourceMatchesProductType", () => {
      test.each([
        {
          productType: TravelDeskInvoiceItem.ProductTypes.AIR,
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: null,
        },
        {
          productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        },
      ])("when $productType has its matching source, validation permits saving", async (source) => {
        // Arrange
        const attributes = {
          productType: source.productType,
          sourceAirSegmentNumber: source.sourceAirSegmentNumber,
          sourceServiceFeeEventExternalIdentifier: source.sourceServiceFeeEventExternalIdentifier,
        }

        // Act
        await travelDeskInvoiceItemFactory.create(attributes)

        // Assert
        expect(await TravelDeskInvoiceItem.findAll()).toEqual([
          expect.objectContaining({
            ...source,
          }),
        ])
      })

      test.each([
        TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
        TravelDeskInvoiceItem.ProductTypes.CREDIT,
        TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
      ])(
        "when %s refers to a source flight segment, it rejects creation",
        async (productType) => {
          // Arrange
          const attributes = {
            productType,
            sourceAirSegmentNumber: 1,
          }

          // Act
          const result = travelDeskInvoiceItemFactory.create(attributes)

          // Assert
          await expect(result).rejects.toThrow(
            "Only air items can refer to a source flight segment."
          )
        }
      )

      test.each([
        TravelDeskInvoiceItem.ProductTypes.AIR,
        TravelDeskInvoiceItem.ProductTypes.CREDIT,
        TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
      ])(
        "when %s refers to a source service fee, it rejects creation",
        async (productType) => {
          // Arrange
          const attributes = {
            productType,
            sourceServiceFeeEventExternalIdentifier: 920002,
          }

          // Act
          const result = travelDeskInvoiceItemFactory.create(attributes)

          // Assert
          await expect(result).rejects.toThrow(
            "Only service fee items can refer to a source service fee."
          )
        }
      )

      test("when an existing air item changes to an incompatible product type, validation rejects it", async () => {
        // Arrange
        const item = await travelDeskInvoiceItemFactory.create({
          productType: TravelDeskInvoiceItem.ProductTypes.AIR,
          grossAmount: "125.500",
          sourceAirSegmentNumber: 1,
        })

        // Act
        const result = item.update({
          productType: TravelDeskInvoiceItem.ProductTypes.CREDIT,
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Only air items can refer to a source flight segment."
        )
      })
    })
  })
})
