import { User } from "@/models"
import { TravelDeskInvoicesPolicy } from "@/policies/travel-desk-invoices-policy"

import { travelDeskInvoiceFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-desk-invoices-policy.ts", () => {
  describe("TravelDeskInvoicesPolicy", () => {
    describe("#show", () => {
      test("when the user is a travel desk officer, it returns true", async () => {
        // Arrange
        const user = await userFactory.asTravelDeskUser().create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.show()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an administrator, it returns true", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.show()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an ordinary user, it returns false", async () => {
        // Arrange
        const user = await userFactory.create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.show()

        // Assert
        expect(result).toEqual(false)
      })
    })

    describe("#create", () => {
      test("when the user is a travel desk officer, it returns true", async () => {
        // Arrange
        const user = await userFactory.asTravelDeskUser().create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.create()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an administrator, it returns true", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.create()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an ordinary user, it returns false", async () => {
        // Arrange
        const user = await userFactory.create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.create()

        // Assert
        expect(result).toEqual(false)
      })
    })

    describe("#update", () => {
      test("when the user is a travel desk officer, it returns true", async () => {
        // Arrange
        const user = await userFactory.asTravelDeskUser().create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.update()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an administrator, it returns true", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.update()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an ordinary user, it returns false", async () => {
        // Arrange
        const user = await userFactory.create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.update()

        // Assert
        expect(result).toEqual(false)
      })
    })

    describe("#destroy", () => {
      test("when the user is a travel desk officer, it returns true", async () => {
        // Arrange
        const user = await userFactory.asTravelDeskUser().create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.destroy()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an administrator, it returns true", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.destroy()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is an ordinary user, it returns false", async () => {
        // Arrange
        const user = await userFactory.create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const result = policy.destroy()

        // Assert
        expect(result).toEqual(false)
      })
    })

    describe("#permitAttributesForCreate", () => {
      test("when read-only fields are submitted, it keeps only editable headers, source selection, and item attributes", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(officer, invoice)

        // Act
        const attributes = policy.permitAttributesForCreate({
          travelDeskTravelRequestId: 999999,
          bookingReference: "FORGED",
          externalBookingEventIdentifier: 123456,
          sourceServiceFeeEventExternalIdentifiers: [123457],
          invoiceNumber: "INV-001",
          grossAmount: "999.000",
          items: [
            {
              productType: "credit",
            },
          ],
          itemsAttributes: [
            {
              id: 999999,
              travelDeskInvoiceId: 999999,
              productType: "air",
              sourceAirSegmentNumber: 1,
              saleType: "sale",
              grossAmount: "25.000",
              position: 0,
            },
          ],
        })

        // Assert
        expect(attributes).toEqual({
          externalBookingEventIdentifier: 123456,
          sourceServiceFeeEventExternalIdentifiers: [123457],
          invoiceNumber: "INV-001",
          itemsAttributes: [
            {
              productType: "air",
              sourceAirSegmentNumber: 1,
              saleType: "sale",
              grossAmount: "25.000",
              position: 0,
            },
          ],
        })
      })
    })

    describe("#permitAttributesForUpdate", () => {
      test("when source selection and read-only fields are submitted, it keeps only editable headers and item attributes", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(officer, invoice)

        // Act
        const attributes = policy.permitAttributesForUpdate({
          travelDeskTravelRequestId: 999999,
          bookingReference: "FORGED",
          externalBookingEventIdentifier: 999999,
          sourceServiceFeeEventExternalIdentifiers: [999999],
          invoiceNumber: "INV-002",
          grossAmount: "999.000",
          items: [
            {
              productType: "credit",
            },
          ],
          itemsAttributes: [
            {
              id: 999999,
              travelDeskInvoiceId: 999999,
              productType: "air",
              sourceAirSegmentNumber: 1,
              saleType: "refund",
              grossAmount: "25.000",
              position: 0,
            },
          ],
        })

        // Assert
        expect(attributes).toEqual({
          invoiceNumber: "INV-002",
          itemsAttributes: [
            {
              productType: "air",
              sourceAirSegmentNumber: 1,
              saleType: "refund",
              grossAmount: "25.000",
              position: 0,
            },
          ],
        })
      })
    })

    describe(".applyScope", () => {
      test("when the user lacks staff access, it excludes an explicitly requested invoice", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const invoice = await travelDeskInvoiceFactory.create()
        const scopedTravelDeskInvoices = TravelDeskInvoicesPolicy.applyScope([], user)

        // Act
        const invoices = await scopedTravelDeskInvoices.findAll({
          where: {
            id: invoice.id,
          },
        })

        // Assert
        expect(invoices).toEqual([])
      })

      test("when the user has travel desk access, it includes active invoices only", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = await travelDeskInvoiceFactory.create()
        const deletedInvoice = await travelDeskInvoiceFactory.create()
        await deletedInvoice.destroy()
        const scopedTravelDeskInvoices = TravelDeskInvoicesPolicy.applyScope([], officer)

        // Act
        const invoices = await scopedTravelDeskInvoices.findAll()

        // Assert
        expect(invoices).toEqual([expect.objectContaining({
          id: invoice.id,
        })])
      })
    })
  })
})
