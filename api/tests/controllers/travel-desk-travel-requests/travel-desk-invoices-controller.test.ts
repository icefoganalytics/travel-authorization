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

      test("when raw source data is retained, it does not expose it in the invoice response", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const invoice = await travelDeskInvoiceFactory.create({
          sourceSnapshot: {
            bookingEvent: {
              travelOrderEvent: {
                TravelOrderIdentifier: 930001,
                OriginalBookingLocation: " YXY ",
              },
              passengers: [],
              airReservationSegments: [],
              serviceFeeTransaction: null,
            },
            serviceFeeEvents: [],
          },
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${invoice.travelDeskTravelRequestId}/travel-desk-invoices/${invoice.id}`
        )

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskInvoice: expect.not.objectContaining({
            sourceSnapshot: expect.anything(),
          }),
        })
      })

      test("when source rows are absent, it still returns the saved booking context", async () => {
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
            bookingContext: invoice.bookingContext,
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
          message: "Failed to create invoice: Error: Parent lookup failed.",
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
            bookingReference: "API001",
            externalBookingEventIdentifier: 930001,
            sourceServiceFeeEventExternalIdentifiers: [],
            currencyCode: "CAD",
            items: [],
          })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to create invoice: InvoiceValidationError: Choose a booking event with flight segments for this booking reference.",
        })
      })

      test("when synced data is created with forged totals and snapshot, it uses local source data and calculated total", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const otherRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await travelDeskBookingEventFactory.create({
          rawSourceSnapshot: {
            travelOrderEvent: {
              TravelOrderIdentifier: 930001,
              RecordLocator: "API001",
              OriginalBookingLocation: " YXY ",
              PnrBfVersionNbr: 8
            },
            passengers: [],
            airReservationSegments: [
              {
                AirSegmentNbr: 1
              }
            ],
            serviceFeeTransaction: null
          },
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
            bookingReference: "api001",
            externalBookingEventIdentifier: 930001,
            sourceServiceFeeEventExternalIdentifiers: [],
            currencyCode: "CAD",
            grossAmount: "999999.999",
            sourceSnapshot: {
              forged: true,
            },
            bookingContext: {
              forged: true,
            },
            items: [
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
          travelDeskInvoice: expect.objectContaining({
            travelDeskTravelRequestId: travelRequest.id,
            bookingReference: "API001",
            externalBookingEventIdentifier: 930001,
            currencyCode: "CAD",
            grossAmount: "125.500",
            bookingContext: {
              bookingEvent: expect.objectContaining({
                travelOrderIdentifier: 930001,
                bookingReference: "API001",
                airReservationSegments: [
                  expect.objectContaining({
                    airSegmentNumber: 1,
                    flightNumber: "1001",
                  }),
                ],
              }),
              serviceFeeEvents: [],
            },
            items: [
              expect.objectContaining({
                sourceAirSegmentNumber: 1,
                grossAmount: "125.500",
                productType: "air",
              }),
            ],
          }),
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
          message: "Failed to update invoice: Error: Parent lookup failed.",
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
        const originalBookingContext = invoice.bookingContext
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
            sourceSnapshot: {
              forged: true,
            },
            bookingContext: {
              forged: true,
            },
            currencyCode: "CAD",
            items: [
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
          travelDeskInvoice: expect.objectContaining({
            travelDeskTravelRequestId: originalRequestId,
            bookingReference: originalBookingReference,
            externalBookingEventIdentifier: originalBookingEventId,
            bookingContext: originalBookingContext,
            invoiceNumber: "INV-ORIGINAL",
            grossAmount: "22.000",
            items: [expect.objectContaining({
              grossAmount: "22.000",
              sourceAirSegmentNumber: 1,
            })],
          }),
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
            items: [
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
          message:
            "Failed to update invoice: InvoiceValidationError: Product type must be one of: air, service_fee, credit, change_fee",
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
            items: [
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
          message:
            "Failed to update invoice: InvoiceValidationError: Amount must be a decimal number.",
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
