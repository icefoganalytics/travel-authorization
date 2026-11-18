import { TravelDeskInvoiceItem } from "@/models"

import { travelDeskInvoiceItemFactory } from "@/factories"

describe("api/src/models/travel-desk-invoice-item.ts", () => {
  describe("TravelDeskInvoiceItem", () => {
    describe("validations - sourceMatchesProductType", () => {
      // Arrange
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
      ])(
        "when saving a selected $productType charge, it retains its booking reference and entered price",
        async (attributes) => {
          // Act
          await travelDeskInvoiceItemFactory.create({
            ...attributes,
            grossAmount: "125.500",
          })

          // Assert
          expect(await TravelDeskInvoiceItem.findAll()).toEqual([
            expect.objectContaining({
              ...attributes,
              grossAmount: "125.500",
            }),
          ])
        }
      )

      // Arrange
      test.each([
        TravelDeskInvoiceItem.ProductTypes.CREDIT,
        TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
      ])(
        "when staff add a manual %s charge, it saves the description and price without a booking source",
        async (productType) => {
          // Act
          await travelDeskInvoiceItemFactory.create({
            productType,
            sourceAirSegmentNumber: null,
            sourceServiceFeeEventExternalIdentifier: null,
            description: "Manual fare adjustment",
            grossAmount: "25.125",
          })

          // Assert
          expect(await TravelDeskInvoiceItem.findAll()).toEqual([
            expect.objectContaining({
              productType,
              sourceAirSegmentNumber: null,
              sourceServiceFeeEventExternalIdentifier: null,
              description: "Manual fare adjustment",
              grossAmount: "25.125",
            }),
          ])
        }
      )

      // Arrange
      test.each([
        TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
        TravelDeskInvoiceItem.ProductTypes.CREDIT,
        TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
      ])(
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
          expect(await TravelDeskInvoiceItem.findAll()).toEqual([])
        }
      )

      // Arrange
      test.each([
        TravelDeskInvoiceItem.ProductTypes.AIR,
        TravelDeskInvoiceItem.ProductTypes.CREDIT,
        TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
      ])(
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
          expect(await TravelDeskInvoiceItem.findAll()).toEqual([])
        }
      )

      test("when a flight charge is relabelled as a credit without clearing its source, the saved charge remains unchanged", async () => {
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
        expect(await item.reload()).toMatchObject({
          productType: TravelDeskInvoiceItem.ProductTypes.AIR,
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: null,
          grossAmount: "125.500",
        })
      })

      test("when both source identities are provided, it rejects creation", async () => {
        // Arrange
        const attributes = {
          productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: 920002,
        }

        // Act
        const result = travelDeskInvoiceItemFactory.create(attributes)

        // Assert
        await expect(result).rejects.toThrow(
          "Only air items can refer to a source flight segment."
        )
        expect(await TravelDeskInvoiceItem.findAll()).toEqual([])
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
        expect(await item.reload()).toMatchObject({
          productType: TravelDeskInvoiceItem.ProductTypes.AIR,
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: null,
        })
      })
    })
  })
})
