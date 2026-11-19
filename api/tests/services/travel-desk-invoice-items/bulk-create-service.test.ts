import { AggregateError, BulkRecordError } from "@sequelize/core"

import { TravelDeskInvoiceItem } from "@/models"

import BulkCreateService from "@/services/travel-desk-invoice-items/bulk-create-service"

import { travelDeskInvoiceFactory } from "@/factories"

describe("api/src/services/travel-desk-invoice-items/bulk-create-service.ts", () => {
  describe("BulkCreateService", () => {
    describe(".perform", () => {
      test("when items have either source identity or neither, it persists the items", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()

        // Act
        await BulkCreateService.perform(invoice.id, [
          {
            productType: TravelDeskInvoiceItem.ProductTypes.AIR,
            sourceAirSegmentNumber: 1,
            saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
            grossAmount: "10.000",
            position: 0,
          },
          {
            productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
            sourceServiceFeeEventExternalIdentifier: 920002,
            saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
            grossAmount: "2.000",
            position: 1,
          },
          {
            productType: TravelDeskInvoiceItem.ProductTypes.CREDIT,
            saleType: TravelDeskInvoiceItem.SaleTypes.REFUND,
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

      test("when an air item also refers to a source service fee, it rejects creation", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()

        // Act
        const result = BulkCreateService.perform(invoice.id, [
          {
            productType: TravelDeskInvoiceItem.ProductTypes.AIR,
            sourceAirSegmentNumber: 1,
            sourceServiceFeeEventExternalIdentifier: 920002,
            saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
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
                  "Only service fee items can refer to a source service fee."
                ),
              }),
            }),
          ],
        })
      })

      test("when a service fee item also refers to a flight segment, it persists none of the batch", async () => {
        // Arrange
        const invoice = await travelDeskInvoiceFactory.create()

        // Act
        const result = BulkCreateService.perform(invoice.id, [
          {
            productType: TravelDeskInvoiceItem.ProductTypes.AIR,
            sourceAirSegmentNumber: 1,
            saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
            grossAmount: "10.000",
            position: 0,
          },
          {
            productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
            sourceAirSegmentNumber: 2,
            sourceServiceFeeEventExternalIdentifier: 920002,
            saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
            grossAmount: "2.000",
            position: 1,
          },
        ])
        await result.then(
          () => {
            throw new Error("Expected bulk creation to fail validation.")
          },
          (error: unknown) => {
            if (!(error instanceof AggregateError) || error.errors.length !== 1) throw error

            const [recordError] = error.errors
            if (
              !(recordError instanceof BulkRecordError) ||
              !recordError.errors.message.includes(
                "Only air items can refer to a source flight segment."
              )
            ) {
              throw error
            }
          }
        )

        // Assert
        expect(await TravelDeskInvoiceItem.findAll()).toEqual([])
      })
    })
  })
})
