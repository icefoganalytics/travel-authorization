import { TravelDeskInvoiceItem, User } from "@/models"
import sourceDatabase from "@/integrations/travelport-integration/db/db-migration-client"

import {
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-invoices-controller.ts", () => {
  describe("TravelDeskInvoicesController", () => {
    describe("POST /api/travel-desk-invoices", () => {
      test("when an unauthorized user creates an invoice, it denies the mutation", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().post("/api/travel-desk-invoices").send({
          travelDeskTravelRequestId: travelRequest.id,
        })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to manage invoices.",
        })
      })

      test("when source-backed data is created with forged totals and snapshot, it uses the source and calculated total", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const airProduct = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        mockCurrentUser(officer)
        await sourceDatabase("TravelOrderEvent").insert({
          TravelOrderIdentifier: 930001,
          RecordLocator: "API001",
          PnrBfVersionNbr: 3,
          EventType: "B",
          DatabaseTimeStamp: "2030-01-01T12:00:00",
        })
        await sourceDatabase("AirRsrvSeg").insert({
          TravelOrderIdentifier: 930001,
          AirSegmentNbr: 1,
          SegmentStatus: "GK",
          CarrierCode: "ZZ",
          BoardPoint: "YXY",
          OffPoint: "YVR",
          FlightNbr: "1001",
          DepartureDate: "2030-01-02",
          DepartureTime: "12:00",
          ArrivalTime: "14:00",
        })

        // Act
        const response = await request()
          .post("/api/travel-desk-invoices")
          .send({
            travelDeskTravelRequestId: travelRequest.id,
            recordLocator: "api001",
            sourceBookingEventId: 930001,
            sourceServiceFeeEventIds: [],
            currencyCode: "CAD",
            grossAmount: "999999.999",
            sourceSnapshot: { forged: true },
            items: [
              {
                travelDeskProductTypeId: airProduct.id,
                sourceAirSegmentNumber: 1,
                saleType: "Sale",
                grossAmount: "125.500",
                position: 0,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelDeskInvoice: expect.objectContaining({
            travelDeskTravelRequestId: travelRequest.id,
            recordLocator: "API001",
            sourceBookingEventId: 930001,
            currencyCode: "CAD",
            grossAmount: "125.500",
            sourceSnapshot: {
              bookingEvent: expect.objectContaining({
                travelOrderIdentifier: 930001,
                recordLocator: "API001",
                airReservationSegments: [
                  expect.objectContaining({ airSegmentNumber: 1, flightNumber: "1001" }),
                ],
              }),
              serviceFeeEvents: [],
            },
            items: [
              expect.objectContaining({
                sourceAirSegmentNumber: 1,
                grossAmount: "125.500",
                productType: expect.objectContaining({ code: "air", name: "Air" }),
              }),
            ],
          }),
        })
      })
    })

    describe("GET /api/travel-desk-invoices/:travelDeskInvoiceId", () => {
      test("when an unauthorized user reads an invoice, it denies access", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().get(`/api/travel-desk-invoices/${invoice.id}`)

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to manage invoices.",
        })
      })
    })

    describe("PATCH /api/travel-desk-invoices/:travelDeskInvoiceId", () => {
      test("when an unauthorized user updates an invoice, it denies the mutation", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().patch(`/api/travel-desk-invoices/${invoice.id}`).send({})

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to manage invoices.",
        })
      })

      test("when source fields and header values are omitted, it preserves immutable data and existing headers", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const invoice = await travelDeskInvoiceFactory.create()
        await invoice.update({ invoiceNumber: "INV-ORIGINAL" })
        const airProduct = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: airProduct })
          .create({
            sourceAirSegmentNumber: 1,
            grossAmount: "10.000",
            saleType: "Sale",
            position: 0,
          })
        const originalRequestId = invoice.travelDeskTravelRequestId
        const originalLocator = invoice.recordLocator
        const originalBookingEventId = invoice.sourceBookingEventId
        const originalSnapshot = invoice.sourceSnapshot
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-invoices/${invoice.id}`)
          .send({
            currencyCode: "CAD",
            items: [
              {
                travelDeskProductTypeId: airProduct.id,
                sourceAirSegmentNumber: 1,
                saleType: "Sale",
                grossAmount: "22.000",
                position: 0,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskInvoice: expect.objectContaining({
            travelDeskTravelRequestId: originalRequestId,
            recordLocator: originalLocator,
            sourceBookingEventId: originalBookingEventId,
            sourceSnapshot: originalSnapshot,
            invoiceNumber: "INV-ORIGINAL",
            grossAmount: "22.000",
            items: [expect.objectContaining({ grossAmount: "22.000", sourceAirSegmentNumber: 1 })],
          }),
        })
      })

      test("when an item has malformed money, it rejects the request without changing the invoice", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const invoice = await travelDeskInvoiceFactory.create({ grossAmount: "10.000" })
        const airProduct = await travelDeskProductTypeFactory.create({ code: "air", name: "Air" })
        await travelDeskInvoiceItemFactory
          .associations({ invoice, productType: airProduct })
          .create({
            sourceAirSegmentNumber: 1,
            grossAmount: "10.000",
            saleType: "Sale",
            position: 0,
          })
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-invoices/${invoice.id}`)
          .send({
            currencyCode: "CAD",
            items: [
              {
                travelDeskProductTypeId: airProduct.id,
                sourceAirSegmentNumber: 1,
                saleType: "Sale",
                grossAmount: "not-money",
                position: 0,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(422)

        // Act
        await invoice.reload()
        const items = await TravelDeskInvoiceItem.findAll({
          where: { travelDeskInvoiceId: invoice.id },
        })

        // Assert
        expect(invoice.grossAmount).toEqual("10.000")
        expect(items).toEqual([
          expect.objectContaining({ grossAmount: "10.000", sourceAirSegmentNumber: 1 }),
        ])
      })
    })

    describe("DELETE /api/travel-desk-invoices/:travelDeskInvoiceId", () => {
      test("when an unauthorized user deletes an invoice, it denies the mutation", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().delete(`/api/travel-desk-invoices/${invoice.id}`)

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to manage invoices.",
        })
      })
    })
  })
})
