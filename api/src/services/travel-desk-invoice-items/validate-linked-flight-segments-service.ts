import { isNil } from "lodash"

import { TravelDeskFlightSegment } from "@/models"

import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items-service"

export class ValidateLinkedFlightSegmentsService extends BaseService {
  constructor(
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[],
    protected travelDeskTravelRequestId: number
  ) {
    super()
  }

  async perform(): Promise<void> {
    const travelDeskFlightSegmentIds = this.collectTravelDeskFlightSegmentIds(this.travelDeskInvoiceItemsAttributes)
    if (travelDeskFlightSegmentIds.length === 0) {
      return
    }

    const travelDeskFlightSegments = await TravelDeskFlightSegment.findAll({
      where: {
        id: travelDeskFlightSegmentIds,
        deletedAt: null,
      },
      include: [
        {
          association: "flightOption",
          where: {
            deletedAt: null,
          },
          include: [
            {
              association: "flightRequest",
              required: true,
              where: {
                travelRequestId: this.travelDeskTravelRequestId,
                deletedAt: null,
              },
            },
          ],
        },
      ],
    })

    if (travelDeskFlightSegments.length !== travelDeskFlightSegmentIds.length) {
      throw new InvoiceValidationError("Linked flight segments must belong to this travel request.")
    }
  }

  private collectTravelDeskFlightSegmentIds(travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]): number[] {
    const travelDeskFlightSegmentIds = new Set<number>()
    for (const travelDeskInvoiceItemAttributes of travelDeskInvoiceItemsAttributes) {
      if (isNil(travelDeskInvoiceItemAttributes.travelDeskFlightSegmentId)) {
        continue
      }

      travelDeskFlightSegmentIds.add(travelDeskInvoiceItemAttributes.travelDeskFlightSegmentId)
    }

    return [...travelDeskFlightSegmentIds]
  }
}

export default ValidateLinkedFlightSegmentsService
