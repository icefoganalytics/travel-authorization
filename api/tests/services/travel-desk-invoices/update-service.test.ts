/// <reference lib="esnext.promise" />

import { DatabaseError, QueryTypes } from "@sequelize/core"

import { db } from "@/db/db-client"
import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"
import { ReferenceSerializer } from "@/serializers/travel-desk-invoice-items"
import ServiceValidationError from "@/services/service-validation-error"
import UpdateService from "@/services/travel-desk-invoices/update-service"

import {
  travelDeskBookingEventFactory,
  travelDeskFlightOptionFactory,
  travelDeskFlightRequestFactory,
  travelDeskFlightSegmentFactory,
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
  travelDeskTravelRequestFactory,
} from "@/factories"

describe("api/src/services/travel-desk-invoices/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test("when editing a serialized line, it saves the edit with a fresh line ID", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        const originalItem = await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })
        const editedItem = { ...ReferenceSerializer.perform(originalItem), grossAmount: "12.345" }

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [editedItem],
        })

        // Assert
        const savedItems = await TravelDeskInvoiceItem.findAll({
          where: { travelDeskInvoiceId: travelDeskInvoice.id },
        })
        const replacementItems = savedItems.filter(({ id }) => id !== originalItem.id)
        expect(replacementItems).toMatchObject([
          {
            grossAmount: "12.345",
          },
        ])
      })

      test("when staff add a change fee, it retains the charge and increases the saved total", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "10.000",
              position: 0,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              description: "Airline booking change",
              sourceAirSegmentNumber: null,
              sourceServiceFeeEventExternalIdentifier: null,
              grossAmount: "5.000",
              position: 1,
            },
          ],
        })

        // Assert
        const persistedTravelDeskInvoice = await TravelDeskInvoice.findByPk(travelDeskInvoice.id, {
          include: [
            {
              association: "items",
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(persistedTravelDeskInvoice).toMatchObject({
          grossAmount: "15.000",
          items: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              grossAmount: "10.000",
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              description: "Airline booking change",
              sourceAirSegmentNumber: null,
              sourceServiceFeeEventExternalIdentifier: null,
              grossAmount: "5.000",
            },
          ],
        })
      })

      test("when staff add a credit refund, it retains the credit and reduces the saved total", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "10.000",
              position: 0,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.CREDIT,
              saleType: TravelDeskInvoiceItem.SaleTypes.REFUND,
              description: "Fare adjustment refund",
              sourceAirSegmentNumber: null,
              sourceServiceFeeEventExternalIdentifier: null,
              grossAmount: "5.000",
              position: 1,
            },
          ],
        })

        // Assert
        const persistedTravelDeskInvoice = await TravelDeskInvoice.findByPk(travelDeskInvoice.id, {
          include: [
            {
              association: "items",
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(persistedTravelDeskInvoice).toMatchObject({
          grossAmount: "5.000",
          items: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              grossAmount: "10.000",
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.CREDIT,
              saleType: TravelDeskInvoiceItem.SaleTypes.REFUND,
              description: "Fare adjustment refund",
              sourceAirSegmentNumber: null,
              sourceServiceFeeEventExternalIdentifier: null,
              grossAmount: "5.000",
            },
          ],
        })
      })

      test("when two line-only edits overlap, it retains exactly one replacement set", async () => {
        // Arrange
        const travelDeskInvoice1 = await travelDeskInvoiceFactory.create({ grossAmount: "10.125" })
        const travelDeskInvoice2 = await TravelDeskInvoice.findByPk(travelDeskInvoice1.id, {
          rejectOnEmpty: true,
        })
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice1 })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        const { promise: locksReleased, resolve: releaseLocks } = Promise.withResolvers<void>()
        const { promise: rowsLocked, resolve: signalLocked } = Promise.withResolvers<void>()
        const holdingTransaction = db.transaction(async (transaction) => {
          await TravelDeskInvoice.findByPk(travelDeskInvoice1.id, {
            lock: transaction.LOCK.UPDATE,
            transaction,
          })
          await TravelDeskInvoiceItem.findAll({
            where: { travelDeskInvoiceId: travelDeskInvoice1.id },
            lock: transaction.LOCK.UPDATE,
            transaction,
          })
          signalLocked()
          await locksReleased
        })
        const locksReady = Promise.race([rowsLocked, holdingTransaction])

        // Act
        const firstUpdate = locksReady.then(() =>
          UpdateService.perform(travelDeskInvoice1, {
            currencyCode: "CAD",
            itemsAttributes: [
              {
                productType: TravelDeskInvoiceItem.ProductTypes.AIR,
                sourceAirSegmentNumber: 1,
                description: "First edit",
                saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
                grossAmount: "10.125",
                position: 0,
              },
            ],
          })
        )
        const secondUpdate = locksReady.then(() =>
          UpdateService.perform(travelDeskInvoice2, {
            currencyCode: "CAD",
            itemsAttributes: [
              {
                productType: TravelDeskInvoiceItem.ProductTypes.AIR,
                sourceAirSegmentNumber: 1,
                description: "Second edit",
                saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
                grossAmount: "10.125",
                position: 0,
              },
            ],
          })
        )
        const completion = Promise.allSettled([holdingTransaction, firstUpdate, secondUpdate])
        try {
          await locksReady
          // Both edits must reach a real database lock before either can finish.
          await vi.waitFor(
            async () => {
              const waitingUpdates = await db.query(
                `SELECT pid FROM pg_stat_activity
                 WHERE datname = current_database()
                   AND state = 'active'
                   AND wait_event_type = 'Lock'
                   AND query LIKE '%travel_desk_invoice%'`,
                { type: QueryTypes.SELECT }
              )
              if (waitingUpdates.length !== 2) {
                throw new Error("Waiting for both invoice edits to reach the locked rows.")
              }
            },
            { timeout: 5000 }
          )
        } finally {
          releaseLocks()
          await completion
        }
        await Promise.all([holdingTransaction, firstUpdate, secondUpdate])

        // Assert
        const persistedTravelDeskInvoice = await TravelDeskInvoice.findByPk(travelDeskInvoice1.id, {
          include: [
            {
              association: "items",
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(persistedTravelDeskInvoice).toMatchObject({
          grossAmount: "10.125",
          items: [
            {
              sourceAirSegmentNumber: 1,
              grossAmount: "10.125",
              description: expect.stringMatching(/^(First|Second) edit$/),
            },
          ],
        })
      }, 10_000)

      test("when its cached source event is deleted, it edits from saved items", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({
          grossAmount: "10.125",
        })
        const travelDeskBookingEvent = await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: travelDeskInvoice.externalBookingEventIdentifier,
          bookingReference: travelDeskInvoice.bookingReference,
        })
        await travelDeskBookingEvent.destroy()
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })
        await travelDeskInvoiceItemFactory.associations({ invoice: travelDeskInvoice }).create({
          productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
          sourceServiceFeeEventExternalIdentifier: 920002,
          grossAmount: "2.000",
          position: 1,
        })

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
              sourceServiceFeeEventExternalIdentifier: 920002,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "3.000",
              position: 1,
            },
          ],
        })

        // Assert
        const persistedTravelDeskInvoice = await TravelDeskInvoice.findByPk(travelDeskInvoice.id, {
          include: [
            {
              association: "items",
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(persistedTravelDeskInvoice).toMatchObject({
          grossAmount: "15.001",
          items: [
            {
              sourceAirSegmentNumber: 1,
              grossAmount: "12.001",
            },
            {
              sourceServiceFeeEventExternalIdentifier: 920002,
              grossAmount: "3.000",
            },
          ],
        })
      })

      test("when an edit omits an existing invoice number, it preserves the saved number", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({
          invoiceNumber: "KEEP-314",
        })
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        const persistedTravelDeskInvoice = await TravelDeskInvoice.findByPk(travelDeskInvoice.id)
        expect(persistedTravelDeskInvoice).toMatchObject({
          invoiceNumber: "KEEP-314",
        })
      })

      test("when optional dates are cleared, it persists null dates", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({
          invoiceDate: "2026-01-01",
          bookingDate: "2026-01-02",
          grossAmount: "10.125",
        })
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          invoiceDate: "",
          bookingDate: "",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "10.125",
              position: 0,
            },
          ],
        })

        // Assert
        const persistedTravelDeskInvoice = await TravelDeskInvoice.findByPk(travelDeskInvoice.id)
        expect(persistedTravelDeskInvoice).toMatchObject({
          invoiceDate: null,
          bookingDate: null,
        })
      })

      test("when a source segment identity is replaced, it rejects the change without saving it", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.125" })
        const originalTravelDeskInvoiceItem = await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 2,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "99.999",
              position: 0,
            },
          ],
        })

        try {
          await result
          throw new Error("Expected the edit to reject the unselected flight segment.")
        } catch (error) {
          if (
            !(error instanceof ServiceValidationError) ||
            error.message !== "Invoice item refers to an unselected flight segment."
          ) {
            throw error
          }
        }

        // Assert
        const travelDeskInvoices = await TravelDeskInvoice.findAll({
          include: [
            {
              association: "items",
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(travelDeskInvoices).toEqual([
          expect.objectContaining({
            grossAmount: "10.125",
            items: [
              expect.objectContaining({
                id: originalTravelDeskInvoiceItem.id,
                sourceAirSegmentNumber: 1,
                grossAmount: "10.125",
              }),
            ],
          }),
        ])
      })

      test("when a flight segment belongs to another request, it rejects cross-request linkage", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.125" })
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })
        const otherTravelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: otherTravelDeskTravelRequest })
          .create()
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest })
          .create()
        const travelDeskFlightSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: travelDeskFlightOption })
          .create()

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              travelDeskFlightSegmentId: travelDeskFlightSegment.id,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message:
            "One or more linked flight segments are no longer available or belong to another travel request. Remove or replace those links before saving.",
        })
      })

      test("when replacement items fail to persist, it rolls back the header and original items together", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({
          invoiceNumber: "KEEP-314",
          grossAmount: "10.125",
        })
        const originalTravelDeskInvoiceItem = await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1, grossAmount: "10.125" })
        const oversizedPassengerName = "A".repeat(256) // The column is varchar(255).

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          invoiceNumber: "SHOULD-ROLL-BACK",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              passengerName: oversizedPassengerName,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        try {
          await result
          throw new Error("Expected the replacement item to exceed the passenger name column limit.")
        } catch (error) {
          if (
            !(error instanceof DatabaseError) ||
            !("code" in error.cause) ||
            error.cause.code !== "22001" // string_data_right_truncation
          ) {
            throw error
          }
        }

        // Assert
        const travelDeskInvoices = await TravelDeskInvoice.findAll({
          include: [
            {
              association: "items",
              paranoid: false,
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(travelDeskInvoices).toEqual([
          expect.objectContaining({
            invoiceNumber: "KEEP-314",
            grossAmount: "10.125",
            items: [
              expect.objectContaining({
                id: originalTravelDeskInvoiceItem.id,
                deletedAt: null,
                sourceAirSegmentNumber: 1,
                grossAmount: "10.125",
              }),
            ],
          }),
        ])
      })

      test("when an item has malformed money, it preserves the invoice and its items", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.000" })
        const originalTravelDeskInvoiceItem = await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({
            sourceAirSegmentNumber: 1,
            grossAmount: "10.000",
            saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
            position: 0,
          })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "not-money",
              position: 0,
            },
          ],
        })

        try {
          await result
          throw new Error("Expected the edit to reject the malformed amount.")
        } catch (error) {
          if (
            !(error instanceof ServiceValidationError) ||
            error.message !== "Amount must be a decimal number."
          ) {
            throw error
          }
        }

        // Assert
        const travelDeskInvoices = await TravelDeskInvoice.findAll({
          include: [
            {
              association: "items",
              separate: true,
              order: [
                ["position", "ASC"],
                ["id", "ASC"],
              ],
            },
          ],
        })
        expect(travelDeskInvoices).toEqual([
          expect.objectContaining({
            grossAmount: "10.000",
            items: [
              expect.objectContaining({
                id: originalTravelDeskInvoiceItem.id,
                grossAmount: "10.000",
                sourceAirSegmentNumber: 1,
              }),
            ],
          }),
        ])
      })

      test("when prices are edited, it preserves the replaced lines as soft-deleted history", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({
          grossAmount: "10.125",
        })
        const originalTravelDeskInvoiceItem = await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({
            sourceAirSegmentNumber: 1,
            grossAmount: "10.125",
          })

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        const travelDeskInvoiceItems = await TravelDeskInvoiceItem.findAll({
          paranoid: false,
          order: [
            ["position", "ASC"],
            ["id", "ASC"],
          ],
        })
        expect(travelDeskInvoiceItems).toEqual([
          expect.objectContaining({
            id: originalTravelDeskInvoiceItem.id,
            sourceAirSegmentNumber: 1,
            grossAmount: "10.125",
            deletedAt: expect.any(Date),
          }),
          expect.objectContaining({
            sourceAirSegmentNumber: 1,
            grossAmount: "12.001",
            deletedAt: null,
          }),
        ])
      })

      test("when a live flight segment belongs to this request, it saves the optional link", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
        const travelDeskInvoice = await travelDeskInvoiceFactory
          .associations({ travelDeskTravelRequest })
          .create()
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create()
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest })
          .create()
        const travelDeskFlightSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: travelDeskFlightOption })
          .create()

        // Act
        await UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              travelDeskFlightSegmentId: travelDeskFlightSegment.id,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        const travelDeskInvoiceItems = await TravelDeskInvoiceItem.findAll()
        expect(travelDeskInvoiceItems).toEqual([
          expect.objectContaining({
            travelDeskFlightSegmentId: travelDeskFlightSegment.id,
          }),
        ])
      })

      test("when its linked flight segment has been deleted, it rejects the link", async () => {
        // Arrange
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create()
        const travelDeskInvoice = await travelDeskInvoiceFactory
          .associations({ travelDeskTravelRequest })
          .create()
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create()
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest })
          .create()
        const travelDeskFlightSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: travelDeskFlightOption })
          .create()
        await travelDeskFlightSegment.destroy()

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              travelDeskFlightSegmentId: travelDeskFlightSegment.id,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message:
            "One or more linked flight segments are no longer available or belong to another travel request. Remove or replace those links before saving.",
        })
      })

      test("when another currency is submitted for saved service fees, it rejects the change", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create({ currencyCode: "CAD" })
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({
            productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
            sourceServiceFeeEventExternalIdentifier: 920002,
          })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "USD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
              sourceServiceFeeEventExternalIdentifier: 920002,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message: "Invoice currency cannot be changed for saved service fees.",
        })
      })

      test("when an edit omits a saved flight segment, it rejects the missing segment", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "1.000",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message: "Every selected flight segment must be represented exactly once.",
        })
      })

      test("when an edit repeats a saved flight segment, it rejects the duplicate", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        await travelDeskInvoiceItemFactory
          .associations({ invoice: travelDeskInvoice })
          .create({ sourceAirSegmentNumber: 1 })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.AIR,
              sourceAirSegmentNumber: 1,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 1,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message: "A selected flight segment can only appear once.",
        })
      })

      test("when an edit replaces a saved service fee, it rejects the unselected fee", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        await travelDeskInvoiceItemFactory.associations({ invoice: travelDeskInvoice }).create({
          productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
              sourceServiceFeeEventExternalIdentifier: 920003,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message: "Invoice item refers to an unselected service fee.",
        })
      })

      test("when an edit omits a saved service fee, it rejects the missing fee", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        await travelDeskInvoiceItemFactory.associations({ invoice: travelDeskInvoice }).create({
          productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.CHANGE_FEE,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "1.000",
              position: 0,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message: "Every selected service fee must be represented exactly once.",
        })
      })

      test("when an edit repeats a saved service fee, it rejects the duplicate", async () => {
        // Arrange
        const travelDeskInvoice = await travelDeskInvoiceFactory.create()
        await travelDeskInvoiceItemFactory.associations({ invoice: travelDeskInvoice }).create({
          productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
          sourceAirSegmentNumber: null,
          sourceServiceFeeEventExternalIdentifier: 920002,
        })

        // Act
        const result = UpdateService.perform(travelDeskInvoice, {
          currencyCode: "CAD",
          itemsAttributes: [
            {
              productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
              sourceServiceFeeEventExternalIdentifier: 920002,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 0,
            },
            {
              productType: TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE,
              sourceServiceFeeEventExternalIdentifier: 920002,
              saleType: TravelDeskInvoiceItem.SaleTypes.SALE,
              grossAmount: "12.001",
              position: 1,
            },
          ],
        })

        // Assert
        await expect(result).rejects.toMatchObject({
          name: ServiceValidationError.name,
          message: "A selected service fee can only appear once.",
        })
      })
    })
  })
})
