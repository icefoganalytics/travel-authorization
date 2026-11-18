import { TravelDeskInvoiceItem } from "@/models"

import { travelDeskInvoiceItemFactory } from "@/factories"

describe("api/src/models/travel-desk-invoice-item.ts", () => {
  describe("TravelDeskInvoiceItem", () => {
    describe("validations - sourceMatchesProductType", () => {
      // Arrange
      test.each([
        {
          productType: "air" as const,
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: null,
        },
        {
          productType: "service_fee" as const,
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        },
      ])(
        "when the source matches $productType, it permits creation",
        async (attributes) => {
          // Act
          await travelDeskInvoiceItemFactory.create(attributes)

          // Assert
          expect(await TravelDeskInvoiceItem.findAll()).toEqual([
            expect.objectContaining(attributes),
          ])
        }
      )

      // Arrange
      test.each(["air", "service_fee", "credit", "change_fee"] as const)(
        "when %s has no source, it permits creation",
        async (productType) => {
          // Act
          const item = await travelDeskInvoiceItemFactory.create({
            productType,
          })

          // Assert
          expect(item.productType).toEqual(productType)
        }
      )

      // Arrange
      test.each(["service_fee", "credit", "change_fee"] as const)(
        "when %s refers to a source flight segment, it rejects creation",
        async (productType) => {
          // Act
          const result = travelDeskInvoiceItemFactory.create({
            productType,
            sourceAirSegmentNumber: 1,
          })

          // Assert
          await expect(result).rejects.toThrow(
            "Only air items can refer to a source flight segment."
          )
        }
      )

      // Arrange
      test.each(["air", "credit", "change_fee"] as const)(
        "when %s refers to a source service fee, it rejects creation",
        async (productType) => {
          // Act
          const result = travelDeskInvoiceItemFactory.create({
            productType,
            sourceServiceFeeEventExternalIdentifier: 920002,
          })

          // Assert
          await expect(result).rejects.toThrow(
            "Only service fee items can refer to a source service fee."
          )
        }
      )

      test("when the product changes without clearing its source, it rejects the update", async () => {
        // Arrange
        const item = await travelDeskInvoiceItemFactory.create({
          sourceAirSegmentNumber: 1,
        })

        // Act
        const result = item.update({
          productType: "credit",
        })

        // Assert
        await expect(result).rejects.toThrow(
          "Only air items can refer to a source flight segment."
        )
      })

      test("when both source identities are provided, it rejects creation", async () => {
        // Arrange
        const attributes = {
          productType: "service_fee" as const,
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: 920002,
        }

        // Act
        const result = travelDeskInvoiceItemFactory.create(attributes)

        // Assert
        await expect(result).rejects.toThrow(
          "Only air items can refer to a source flight segment."
        )
      })

      test("when an update adds a second source identity, it rejects the update", async () => {
        // Arrange
        const item = await travelDeskInvoiceItemFactory.create({ sourceAirSegmentNumber: 1 })

        // Act
        const result = item.update({ sourceServiceFeeEventExternalIdentifier: 920002 })

        // Assert
        await expect(result).rejects.toThrow(
          "Only service fee items can refer to a source service fee."
        )
      })

      test("when an update replaces the source identity, it permits the update", async () => {
        // Arrange
        const item = await travelDeskInvoiceItemFactory.create({ sourceAirSegmentNumber: 1 })

        // Act
        await item.update({
          productType: "service_fee",
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        })

        // Assert
        expect(await TravelDeskInvoiceItem.findAll()).toEqual([
          expect.objectContaining({
            productType: "service_fee",
            sourceAirSegmentNumber: null,
            sourceServiceFeeEventExternalIdentifier: 920002,
          }),
        ])
      })
    })
  })
})
