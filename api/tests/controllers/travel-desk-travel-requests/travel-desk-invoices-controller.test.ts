import qs from "qs"

import { TravelDeskTravelRequest } from "@/models"

import { mockCurrentUser, request } from "@/support"

import {
  travelDeskBookingEventFactory,
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import TravelDeskInvoicesController from "@/controllers/travel-desk-travel-requests/travel-desk-invoices-controller"

describe("api/src/controllers/travel-desk-travel-requests/travel-desk-invoices-controller.ts", () => {
  describe("TravelDeskInvoicesController", () => {
    describe("#index - GET /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-invoices", () => {
      test("when the user lacks parent access, it denies the invoice index", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to list invoices for this travel request.",
        })
      })

      test("when filtering and paginating, it counts only matching invoices within the URL parent", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const otherRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskInvoiceFactory
          .associations({
            travelDeskTravelRequest: travelRequest,
          })
          .create({
            invoiceNumber: "INV-001",
            currencyCode: "CAD",
          })
        const invoice2 = await travelDeskInvoiceFactory
          .associations({
            travelDeskTravelRequest: travelRequest,
          })
          .create({
            invoiceNumber: "INV-002",
            currencyCode: "CAD",
          })
        await travelDeskInvoiceFactory
          .associations({
            travelDeskTravelRequest: travelRequest,
          })
          .create({
            invoiceNumber: "INV-003",
            currencyCode: "USD",
          })
        await travelDeskInvoiceFactory
          .associations({
            travelDeskTravelRequest: otherRequest,
          })
          .create({
            invoiceNumber: "INV-004",
            currencyCode: "CAD",
          })
        mockCurrentUser(officer)

        // Act
        const query = qs.stringify({
          where: {
            travelDeskTravelRequestId: otherRequest.id,
            currencyCode: "CAD",
          },
          order: [["invoiceNumber", "ASC"]],
          page: 2,
          perPage: 1,
        })
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`)
          .query(query)

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskInvoices: [expect.objectContaining({
            id: invoice2.id,
            items: [],
          })],
          totalCount: 2,
        })
      })

      test("when invoices have multiple items and matching timestamps, it paginates invoices with complete ordered items", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const createdAt = new Date("2026-01-01T12:00:00Z")
        await travelDeskInvoiceFactory
          .associations({
            travelDeskTravelRequest: travelRequest,
          })
          .create({
            createdAt,
          })
        const invoice2 = await travelDeskInvoiceFactory
          .associations({
            travelDeskTravelRequest: travelRequest,
          })
          .create({
            createdAt,
          })
        const item1 = await travelDeskInvoiceItemFactory
          .associations({
            invoice: invoice2,
          })
          .create({
            position: 1,
            productType: "air",
          })
        const item2 = await travelDeskInvoiceItemFactory
          .associations({
            invoice: invoice2,
          })
          .create({
            position: 0,
            productType: "air",
          })
        const item3 = await travelDeskInvoiceItemFactory
          .associations({
            invoice: invoice2,
          })
          .create({
            position: 0,
            productType: "credit",
          })
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`)
          .query({
            page: 1,
            perPage: 1,
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskInvoices: [
            expect.objectContaining({
              id: invoice2.id,
              items: [
                expect.objectContaining({
                  id: item2.id,
                  position: 0,
                  productType: "air",
                }),
                expect.objectContaining({
                  id: item3.id,
                  position: 0,
                  productType: "credit",
                }),
                expect.objectContaining({
                  id: item1.id,
                  position: 1,
                  productType: "air",
                }),
              ],
            }),
          ],
          totalCount: 2,
        })
      })

      test("when query preparation fails, it returns the index error response", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(TravelDeskInvoicesController.prototype, "buildWhere").mockImplementationOnce(
          () => {
            throw new Error("Query preparation failed.")
          }
        )

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`
        )

        // Assert
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          message: "Failed to load invoices.",
        })
      })

      test("when the parent is missing, it returns not found", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({
          force: true,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel request not found.",
        })
      })

      test("when the parent lookup fails, it returns the index error response", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(TravelDeskTravelRequest, "findByPk").mockRejectedValueOnce(
          new Error("Parent lookup failed.")
        )

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`
        )

        // Assert
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          message: "Failed to load invoices.",
        })
      })
    })

    describe("#show - GET /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-invoices/:travelDeskInvoiceId", () => {
      test("when the parent is missing, it returns not found", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({
          force: true,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/999999`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel request not found.",
        })
      })

      test("when the parent lookup fails, it returns the show error response", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(TravelDeskTravelRequest, "findByPk").mockRejectedValueOnce(
          new Error("Parent lookup failed.")
        )

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/999999`
        )

        // Assert
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          message: "Failed to load invoice.",
        })
      })

      test("when the invoice belongs to another parent, it returns not found", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .get(
            `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/${invoice.id}`
          )
          .query({
            travelDeskTravelRequestId: invoice.travelDeskTravelRequestId,
          })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Invoice not found.",
        })
      })

      test("when an unauthorized user reads an invoice, it denies access", async () => {
        // Arrange
        const user = await userFactory.create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to view invoices for this travel request.",
        })
      })

      test("when source rows are absent, it still returns the saved invoice", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
        )

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskInvoice: expect.objectContaining({
            id: invoice.id,
            travelDeskTravelRequestId: invoice.travelDeskTravelRequestId,
            bookingReference: invoice.bookingReference,
            externalBookingEventIdentifier: invoice.externalBookingEventIdentifier,
            items: [],
          }),
        })
      })
    })

    describe("#create - POST /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-invoices", () => {
      test("when the parent is missing, it returns not found before processing invoice inputs", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({
          force: true,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().post(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel request not found.",
        })
      })

      test("when the parent lookup fails, it returns the creation error response", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(TravelDeskTravelRequest, "findByPk").mockRejectedValueOnce(
          new Error("Parent lookup failed.")
        )

        // Act
        const response = await request().post(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`
        )

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Invoice could not be created.",
        })
      })

      test("when an unauthorized user creates an invoice, it denies the mutation", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`)
          .send({})

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to create invoices for this travel request.",
        })
      })

      test("when a selected booking has not been synced locally, it rejects invoice creation", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`)
          .send({
            externalBookingEventIdentifier: 930001,
            sourceServiceFeeEventExternalIdentifiers: [],
            currencyCode: "CAD",
            itemsAttributes: [],
          })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "The selected booking event was not found.",
        })
      })

      test("when no booking reference is submitted and the total is forged, it uses the synced booking reference and calculated total", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const otherRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 930001,
          bookingReference: "API001",
          bookingFileVersionNumber: 3,
          eventType: "B",
          airReservationSegments: [
            {
              airSegmentNumber: 1,
              segmentStatus: "GK",
              carrierCode: "ZZ",
              boardPoint: "YXY",
              offPoint: "YVR",
              flightNumber: "1001",
              departureDate: "2030-01-02",
              departureTime: "12:00",
              arrivalTime: "14:00",
              changeOfDay: null,
            },
          ],
        })

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices`)
          .send({
            travelDeskTravelRequestId: otherRequest.id,
            externalBookingEventIdentifier: 930001,
            sourceServiceFeeEventExternalIdentifiers: [],
            currencyCode: "CAD",
            grossAmount: "999999.999",
            itemsAttributes: [
              {
                productType: "air",
                sourceAirSegmentNumber: 1,
                saleType: "sale",
                grossAmount: "125.500",
                position: 0,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelDeskInvoice: {
            id: expect.any(Number),
            travelDeskTravelRequestId: travelRequest.id,
            bookingReference: "API001",
            externalBookingEventIdentifier: 930001,
            currencyCode: "CAD",
            invoiceNumber: null,
            invoiceDate: null,
            warrantNumber: null,
            clientNumber: null,
            clientName: null,
            department: null,
            mailcode: null,
            iataNumber: null,
            bookingAgentName: null,
            ticketingAgentName: null,
            bookingDate: null,
            grossAmount: "125.500",
            items: [
              {
                id: expect.any(Number),
                productType: "air",
                travelDeskFlightSegmentId: null,
                sourceAirSegmentNumber: 1,
                sourceServiceFeeEventExternalIdentifier: null,
                passengerName: null,
                ticketNumber: null,
                vendor: null,
                description: null,
                saleType: "sale",
                grossAmount: "125.500",
                position: 0,
              },
            ],
          },
        })
      })
    })

    describe("#update - PATCH /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-invoices/:travelDeskInvoiceId", () => {
      test("when the parent is missing, it returns not found before processing invoice inputs", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({
          force: true,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().patch(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/999999`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel request not found.",
        })
      })

      test("when the parent lookup fails, it returns the update error response", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(TravelDeskTravelRequest, "findByPk").mockRejectedValueOnce(
          new Error("Parent lookup failed.")
        )

        // Act
        const response = await request().patch(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/999999`
        )

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Invoice could not be updated.",
        })
      })

      test("when the invoice belongs to another parent, it returns not found despite submitted ownership", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .patch(
            `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/${invoice.id}`
          )
          .send({
            travelDeskTravelRequestId: invoice.travelDeskTravelRequestId,
          })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Invoice not found.",
        })
      })

      test("when an unauthorized user updates an invoice, it denies the mutation", async () => {
        // Arrange
        const user = await userFactory.create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request()
          .patch(
            `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
          )
          .send({})

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update invoices for this travel request.",
        })
      })

      test("when source identity and parent are forged and headers omitted, it preserves saved source data and headers", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = await travelDeskInvoiceFactory.create({
          invoiceNumber: "INV-ORIGINAL",
        })
        const otherRequest = await travelDeskTravelRequestFactory.create()
        await travelDeskInvoiceItemFactory
          .associations({
            invoice,
          })
          .create({
            sourceAirSegmentNumber: 1,
            grossAmount: "10.000",
            saleType: "sale",
            position: 0,
          })
        const originalRequestId = invoice.travelDeskTravelRequestId
        const originalBookingReference = invoice.bookingReference
        const originalBookingEventId = invoice.externalBookingEventIdentifier
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .patch(
            `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
          )
          .send({
            travelDeskTravelRequestId: otherRequest.id,
            bookingReference: "FORGED",
            externalBookingEventIdentifier: 999999,
            currencyCode: "CAD",
            itemsAttributes: [
              {
                productType: "air",
                sourceAirSegmentNumber: 1,
                saleType: "sale",
                grossAmount: "22.000",
                position: 0,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskInvoice: {
            id: invoice.id,
            travelDeskTravelRequestId: originalRequestId,
            bookingReference: originalBookingReference,
            externalBookingEventIdentifier: originalBookingEventId,
            currencyCode: "CAD",
            invoiceNumber: "INV-ORIGINAL",
            invoiceDate: null,
            warrantNumber: null,
            clientNumber: null,
            clientName: null,
            department: null,
            mailcode: null,
            iataNumber: null,
            bookingAgentName: null,
            ticketingAgentName: null,
            bookingDate: null,
            grossAmount: "22.000",
            items: [
              {
                id: expect.any(Number),
                productType: "air",
                travelDeskFlightSegmentId: null,
                sourceAirSegmentNumber: 1,
                sourceServiceFeeEventExternalIdentifier: null,
                passengerName: null,
                ticketNumber: null,
                vendor: null,
                description: null,
                saleType: "sale",
                grossAmount: "22.000",
                position: 0,
              },
            ],
          },
        })
      })

      test("when an item has a custom product type, it rejects the request", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .patch(
            `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
          )
          .send({
            currencyCode: "CAD",
            itemsAttributes: [
              {
                productType: "custom-fee",
                sourceAirSegmentNumber: 1,
                saleType: "sale",
                grossAmount: "10.000",
                position: 0,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Product type must be one of: air, service_fee, credit, change_fee",
        })
      })

      test("when an item has malformed money, it rejects the request", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = await travelDeskInvoiceFactory.create({
          grossAmount: "10.000",
        })
        await travelDeskInvoiceItemFactory
          .associations({
            invoice,
          })
          .create({
            sourceAirSegmentNumber: 1,
            grossAmount: "10.000",
            saleType: "sale",
            position: 0,
          })
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .patch(
            `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
          )
          .send({
            currencyCode: "CAD",
            itemsAttributes: [
              {
                productType: "air",
                sourceAirSegmentNumber: 1,
                saleType: "sale",
                grossAmount: "not-money",
                position: 0,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Amount must be a decimal number.",
        })
      })
    })

    describe("#destroy - DELETE /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-invoices/:travelDeskInvoiceId", () => {
      test("when the parent is missing, it returns not found", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({
          force: true,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().delete(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/999999`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel request not found.",
        })
      })

      test("when the parent lookup fails, it returns the deletion error response", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(TravelDeskTravelRequest, "findByPk").mockRejectedValueOnce(
          new Error("Parent lookup failed.")
        )

        // Act
        const response = await request().delete(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/999999`
        )

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Invoice could not be deleted.",
        })
      })

      test("when the invoice belongs to another parent, it returns not found despite submitted ownership", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .delete(
            `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-invoices/${invoice.id}`
          )
          .send({
            travelDeskTravelRequestId: invoice.travelDeskTravelRequestId,
          })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Invoice not found.",
        })
      })

      test("when an unauthorized user deletes an invoice, it denies the mutation", async () => {
        // Arrange
        const user = await userFactory.create()
        const invoice = await travelDeskInvoiceFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().delete(
          `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to delete invoices for this travel request.",
        })
      })
    })
  })
})
