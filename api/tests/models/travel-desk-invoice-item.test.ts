import { TravelDeskInvoiceItem } from "@/models"

import { travelDeskInvoiceItemFactory } from "@/factories"

describe("api/src/models/travel-desk-invoice-item.ts", () => {
  describe("TravelDeskInvoiceItem", () => {
    describe("validations - exclusiveSourceIdentity", () => {
      test.each([
        { sourceAirSegmentNumber: null, sourceServiceFeeEventExternalIdentifier: null },
        { sourceAirSegmentNumber: 1, sourceServiceFeeEventExternalIdentifier: null },
        { sourceAirSegmentNumber: null, sourceServiceFeeEventExternalIdentifier: 920002 },
      ])(
        "when the source identity is $sourceAirSegmentNumber / $sourceServiceFeeEventExternalIdentifier, it permits creation",
        async (attributes) => {
          // Arrange
          const { sourceAirSegmentNumber, sourceServiceFeeEventExternalIdentifier } = attributes

          // Act
          await travelDeskInvoiceItemFactory.create({
            sourceAirSegmentNumber,
            sourceServiceFeeEventExternalIdentifier,
          })

          // Assert
          expect(await TravelDeskInvoiceItem.findAll()).toEqual([
            expect.objectContaining(attributes),
          ])
        }
      )

      test("when both source identities are provided, it rejects creation", async () => {
        // Arrange
        const attributes = {
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: 920002,
        }

        // Act
        const result = travelDeskInvoiceItemFactory.create(attributes)

        // Assert
        await expect(result).rejects.toThrow(
          "An item cannot refer to both a flight segment and service fee."
        )
      })

      test("when an update adds a second source identity, it rejects the update", async () => {
        // Arrange
        const item = await travelDeskInvoiceItemFactory.create({ sourceAirSegmentNumber: 1 })

        // Act
        const result = item.update({ sourceServiceFeeEventExternalIdentifier: 920002 })

        // Assert
        await expect(result).rejects.toThrow(
          "An item cannot refer to both a flight segment and service fee."
        )
      })

      test("when an update replaces the source identity, it permits the update", async () => {
        // Arrange
        const item = await travelDeskInvoiceItemFactory.create({ sourceAirSegmentNumber: 1 })

        // Act
        await item.update({
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        })

        // Assert
        expect(await TravelDeskInvoiceItem.findAll()).toEqual([
          expect.objectContaining({
            sourceAirSegmentNumber: null,
            sourceServiceFeeEventExternalIdentifier: 920002,
          }),
        ])
      })
    })
  })
})
