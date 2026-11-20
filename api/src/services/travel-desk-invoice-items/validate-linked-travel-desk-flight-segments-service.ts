import { isEmpty, isNil, uniq } from "lodash"

import { TravelDeskFlightSegment } from "@/models"

import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-travel-desk-invoice-items-service"

export class ValidateLinkedTravelDeskFlightSegmentsService extends BaseService {
  constructor(
    protected travelDeskTravelRequestId: number,
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ) {
    super()
  }

  async perform(): Promise<void> {
    const travelDeskFlightSegmentIds = uniq(
      this.travelDeskInvoiceItemsAttributes
        .map(({ travelDeskFlightSegmentId }) => travelDeskFlightSegmentId)
        .filter(
          (travelDeskFlightSegmentId): travelDeskFlightSegmentId is number => !isNil(travelDeskFlightSegmentId)
        )
    )
    if (isEmpty(travelDeskFlightSegmentIds)) return

    const matchingTravelDeskFlightSegmentCount = await TravelDeskFlightSegment.count({
      where: {
        id: travelDeskFlightSegmentIds,
      },
      include: [
        {
          association: "flightOption",
          required: true,
          include: [
            {
              association: "flightRequest",
              required: true,
              where: {
                travelRequestId: this.travelDeskTravelRequestId,
              },
            },
          ],
        },
      ],
    })

    if (matchingTravelDeskFlightSegmentCount !== travelDeskFlightSegmentIds.length) {
      throw new ServiceValidationError({
        field: "items",
        text: "One or more linked flight segments are no longer available or belong to another travel request. Remove or replace those links before saving.",
      })
    }
  }
}

export default ValidateLinkedTravelDeskFlightSegmentsService
