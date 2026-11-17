import { isNil } from "lodash"

import { TravelDeskFlightOption, TravelDeskFlightRequest, TravelDeskFlightSegment } from "@/models"

import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { type InvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items"

export class ValidateLinkedFlightSegmentsService extends BaseService {
  constructor(
    protected items: InvoiceItemAttributes[],
    protected travelDeskTravelRequestId: number
  ) {
    super()
  }

  async perform(): Promise<void> {
    const segmentIds = this.collectSegmentIds()
    if (segmentIds.length === 0) {
      return
    }

    const segments = await TravelDeskFlightSegment.findAll({
      where: {
        id: segmentIds,
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
                travelRequestId: this.travelDeskTravelRequestId,
                deletedAt: null,
              },
            },
          ],
        },
      ],
    })

    if (segments.length !== segmentIds.length) {
      throw new InvoiceValidationError("Linked flight segments must belong to this travel request.")
    }
  }

  private collectSegmentIds(): number[] {
    const segmentIds = new Set<number>()
    for (const item of this.items) {
      if (isNil(item.travelDeskFlightSegmentId)) {
        continue
      }

      segmentIds.add(item.travelDeskFlightSegmentId)
    }

    return [...segmentIds]
  }
}

export default ValidateLinkedFlightSegmentsService
