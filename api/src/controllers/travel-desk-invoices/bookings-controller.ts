import { isNil } from "lodash"

import {
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  TravelDeskTravelRequest,
} from "@/models"
import { type InvoiceBookingEvent } from "@/models/travel-desk-invoice"
import { TravelDeskInvoicesPolicy } from "@/policies/travel-desk-invoices-policy"
import {
  normalizeRecordLocator,
  SourceService,
  SourceUnavailableError,
} from "@/services/travel-desk-invoices/source-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"
import BaseController from "@/controllers/base-controller"

export class BookingsController extends BaseController {
  async index() {
    if (!this.isTravelDeskStaff()) {
      return this.response.status(403).json({
        message: "You are not authorized to access booking sources.",
      })
    }

    const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
    if (isNil(travelDeskTravelRequest)) {
      return this.response.status(404).json({
        message: "Travel desk travel request not found.",
      })
    }

    let bookingEvents: InvoiceBookingEvent[] = []
    if (typeof this.query.recordLocator !== "undefined") {
      if (typeof this.query.recordLocator !== "string") {
        return this.response.status(422).json({
          message: "Record locator must contain six letters or numbers.",
        })
      }

      try {
        const recordLocator = normalizeRecordLocator(this.query.recordLocator)
        bookingEvents = await SourceService.perform(recordLocator)
      } catch (error) {
        if (error instanceof InvoiceValidationError) {
          return this.response.status(422).json({
            message: "Record locator must contain six letters or numbers.",
          })
        }

        if (error instanceof SourceUnavailableError) {
          return this.response.status(503).json({
            message: "Booking source is unavailable.",
          })
        }

        return this.response.status(503).json({
          message: "Booking source is unavailable.",
        })
      }
    }

    const flightSegments = await TravelDeskFlightSegment.findAll({
      where: {
        deletedAt: null,
      },
      include: [
        {
          model: TravelDeskFlightOption,
          where: {
            deletedAt: null,
          },
          include: [
            {
              model: TravelDeskFlightRequest,
              required: true,
              where: {
                travelRequestId: travelDeskTravelRequest.id,
                deletedAt: null,
              },
            },
          ],
        },
      ],
    })

    return this.response.status(200).json({
      bookingEvents,
      flightSegments: flightSegments.map((segment) => ({
        id: segment.id,
        flightNumber: segment.flightNumber,
        departLocation: segment.departLocation,
        arriveLocation: segment.arriveLocation,
        departAt: segment.departAt,
        arriveAt: segment.arriveAt,
      })),
    })
  }

  private loadTravelDeskTravelRequest(): Promise<TravelDeskTravelRequest | null> {
    const travelDeskTravelRequestId = Number(this.params.travelDeskTravelRequestId)
    return TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId)
  }

  private isTravelDeskStaff(): boolean {
    return TravelDeskInvoicesPolicy.isStaff(this.currentUser)
  }
}

export default BookingsController
