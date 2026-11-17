import { AggregateError } from "@sequelize/core"

import { TravelDeskInvoiceItem } from "@/models"

import { BulkCreateService } from "@/services/travel-desk-invoice-items"

import { travelDeskInvoiceFactory } from "@/factories"

describe("api/src/services/travel-desk-invoice-items/bulk-create-service.ts", () => {
  describe("BulkCreateService.perform", () => {
    test("when items have neither or either source identity, it persists the items", async () => {
      // Arrange
      const invoice = await travelDeskInvoiceFactory.create()

      // Act
      await BulkCreateService.perform(invoice.id, [
        {
          productType: "air",
          sourceAirSegmentNumber: 1,
          saleType: "Sale",
          grossAmount: "10.000",
          position: 0,
        },
        {
          productType: "service_fee",
          sourceServiceFeeEventExternalIdentifier: 920002,
          saleType: "Sale",
          grossAmount: "2.000",
          position: 1,
        },
        {
          productType: "credit",
          saleType: "Refund",
          grossAmount: "1.000",
          position: 2,
        },
      ])

      // Assert
      expect(await TravelDeskInvoiceItem.findAll({ order: [["position", "ASC"]] })).toEqual([
        expect.objectContaining({
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: null,
        }),
        expect.objectContaining({
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        }),
        expect.objectContaining({
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: null,
        }),
      ])
    })

    test("when an item has both source identities, it rejects the bulk creation", async () => {
      // Arrange
      const invoice = await travelDeskInvoiceFactory.create()

      // Act
      const result = BulkCreateService.perform(invoice.id, [
        {
          productType: "air",
          sourceAirSegmentNumber: 1,
          sourceServiceFeeEventExternalIdentifier: 920002,
          saleType: "Sale",
          grossAmount: "10.000",
          position: 0,
        },
      ])

      // Assert
      await expect(result).rejects.toMatchObject({
        errors: [
          expect.objectContaining({
            errors: expect.objectContaining({
              message: expect.stringContaining(
                "An item cannot refer to both a flight segment and service fee."
              ),
            }),
          }),
        ],
      })
    })

    test("when a bulk creation fails validation, it does not persist any items", async () => {
      // Arrange
      const invoice = await travelDeskInvoiceFactory.create()

      // Act
      const result = BulkCreateService.perform(invoice.id, [
        {
          productType: "air",
          sourceAirSegmentNumber: 1,
          saleType: "Sale",
          grossAmount: "10.000",
          position: 0,
        },
        {
          productType: "service_fee",
          sourceAirSegmentNumber: 2,
          sourceServiceFeeEventExternalIdentifier: 920002,
          saleType: "Sale",
          grossAmount: "2.000",
          position: 1,
        },
      ])
      await result.catch((error: unknown) => {
        if (!(error instanceof AggregateError)) throw error
      })

      // Assert
      expect(await TravelDeskInvoiceItem.findAll()).toEqual([])
    })
  })
})
