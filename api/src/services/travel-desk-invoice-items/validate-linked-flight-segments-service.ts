import { isEmpty, isNil, uniq } from "lodash"

import { TravelDeskFlightSegment } from "@/models"

import BaseService from "@/services/base-service"
import TravelDeskInvoiceValidationError from "@/services/travel-desk-invoices/invoice-validation-error"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items-service"

export class ValidateLinkedFlightSegmentsService extends BaseService {
  constructor(
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[],
    protected travelDeskTravelRequestId: number
  ) {
    super()
  }

  async perform(): Promise<void> {
    const travelDeskFlightSegmentIds = uniq(
      this.travelDeskInvoiceItemsAttributes
        .map(({ travelDeskFlightSegmentId }) => travelDeskFlightSegmentId)
        .filter((id): id is number => !isNil(id))
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
      throw new TravelDeskInvoiceValidationError(
        "One or more linked flight segments are no longer available or belong to another travel request. Remove or replace those links before saving."
      )
    }
  }
}

export default ValidateLinkedFlightSegmentsService
