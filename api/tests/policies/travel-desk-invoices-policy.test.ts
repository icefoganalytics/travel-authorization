import { User } from "@/models"
import { TravelDeskInvoicesPolicy } from "@/policies/travel-desk-invoices-policy"

import { travelDeskInvoiceFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-desk-invoices-policy.ts", () => {
  describe("TravelDeskInvoicesPolicy", () => {
    describe("#toJSON", () => {
      test("when the user is a travel desk officer, it permits invoice management", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(officer, invoice)

        // Act
        const permissions = policy.toJSON()

        // Assert
        expect(permissions).toEqual({
          show: true,
          create: true,
          update: true,
          destroy: true,
        })
      })

      test("when the user is an administrator, it permits invoice management", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(admin, invoice)

        // Act
        const permissions = policy.toJSON()

        // Assert
        expect(permissions).toEqual({
          show: true,
          create: true,
          update: true,
          destroy: true,
        })
      })

      test("when the user lacks staff access, it denies every invoice action", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(user, invoice)

        // Act
        const permissions = policy.toJSON()

        // Assert
        expect(permissions).toEqual({
          show: false,
          create: false,
          update: false,
          destroy: false,
        })
      })
    })

    describe("#permitAttributesForCreate", () => {
      test("when ownership and totals are submitted, it keeps only editable headers and source selection", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(officer, invoice)

        // Act
        const attributes = policy.permitAttributesForCreate({
          travelDeskTravelRequestId: 999999,
          recordLocator: "SRC001",
          sourceBookingEventId: 123456,
          invoiceNumber: "INV-001",
          grossAmount: "999.000",
        })

        // Assert
        expect(attributes).toEqual({
          recordLocator: "SRC001",
          sourceBookingEventId: 123456,
          invoiceNumber: "INV-001",
        })
      })
    })

    describe("#permitAttributesForUpdate", () => {
      test("when source identity and ownership are submitted, it keeps only editable headers", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const invoice = travelDeskInvoiceFactory.build()
        const policy = new TravelDeskInvoicesPolicy(officer, invoice)

        // Act
        const attributes = policy.permitAttributesForUpdate({
          travelDeskTravelRequestId: 999999,
          recordLocator: "FORGED",
          sourceBookingEventId: 999999,
          invoiceNumber: "INV-002",
          grossAmount: "999.000",
        })

        // Assert
        expect(attributes).toEqual({
          invoiceNumber: "INV-002",
        })
      })
    })

    describe(".applyScope", () => {
      test("when the user lacks staff access, it excludes an explicitly requested invoice", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const invoice = await travelDeskInvoiceFactory.create()
        const scopedTravelDeskInvoices = TravelDeskInvoicesPolicy.applyScope([], user)

        // Act
        const invoices = await scopedTravelDeskInvoices.findAll({ where: { id: invoice.id } })

        // Assert
        expect(invoices).toEqual([])
      })

      test("when the user has travel desk access, it includes active invoices only", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const invoice = await travelDeskInvoiceFactory.create()
        const deletedInvoice = await travelDeskInvoiceFactory.create()
        await deletedInvoice.destroy()
        const scopedTravelDeskInvoices = TravelDeskInvoicesPolicy.applyScope([], officer)

        // Act
        const invoices = await scopedTravelDeskInvoices.findAll()

        // Assert
        expect(invoices).toEqual([expect.objectContaining({ id: invoice.id })])
      })
    })
  })
})
