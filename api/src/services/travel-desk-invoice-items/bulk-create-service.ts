import { isEmpty, isNil, pick, uniq } from "lodash"

import { TravelDeskFlightSegment, type TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoice-items"

export class BulkCreateService extends BaseService {
  constructor(
    protected travelDeskInvoice: TravelDeskInvoice,
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ) {
    super()
  }

  async perform(): Promise<void> {
    await this.assertLinkedFlightSegmentsBelongToTravelRequest(
      this.travelDeskInvoice.travelDeskTravelRequestId,
      this.travelDeskInvoiceItemsAttributes
    )

    const travelDeskInvoiceItemCreationAttributes = this.travelDeskInvoiceItemsAttributes.map(
      (travelDeskInvoiceItemAttributes) => ({
        ...pick(travelDeskInvoiceItemAttributes, [
          "productType",
          "travelDeskFlightSegmentId",
          "sourceAirSegmentNumber",
          "sourceServiceFeeEventExternalIdentifier",
          "passengerName",
          "ticketNumber",
          "vendor",
          "description",
          "saleType",
          "grossAmount",
          "position",
        ]),
        travelDeskInvoiceId: this.travelDeskInvoice.id,
      })
    )

    await TravelDeskInvoiceItem.bulkCreate(travelDeskInvoiceItemCreationAttributes, {
      validate: true,
    })
  }

  private async assertLinkedFlightSegmentsBelongToTravelRequest(
    travelDeskTravelRequestId: number,
    travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ): Promise<void> {
    const travelDeskFlightSegmentIds = uniq(
      travelDeskInvoiceItemsAttributes
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
                travelRequestId: travelDeskTravelRequestId,
              },
            },
          ],
        },
      ],
    })

    if (matchingTravelDeskFlightSegmentCount !== travelDeskFlightSegmentIds.length) {
      throw new ServiceValidationError(
        "One or more linked flight segments are no longer available or belong to another travel request. Remove or replace those links before saving."
      )
    }
  }
}

export default BulkCreateService
