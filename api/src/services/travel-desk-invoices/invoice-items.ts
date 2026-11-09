import { type CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import {
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  TravelDeskInvoiceItem,
} from "@/models"

import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"
import { type InvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items"

export async function validateLinkedFlightSegments(
  items: InvoiceItemAttributes[],
  travelDeskTravelRequestId: number
): Promise<void> {
  const segmentIds = [
    ...new Set(
      items.flatMap((item) =>
        isNil(item.travelDeskFlightSegmentId) ? [] : [item.travelDeskFlightSegmentId]
      )
    ),
  ]
  if (segmentIds.length === 0) {
    return
  }

  const segments = await TravelDeskFlightSegment.findAll({
    where: { id: segmentIds, deletedAt: null },
    include: [
      {
        model: TravelDeskFlightOption,
        where: { deletedAt: null },
        include: [
          {
            model: TravelDeskFlightRequest,
            required: true,
            where: { travelRequestId: travelDeskTravelRequestId, deletedAt: null },
          },
        ],
      },
    ],
  })

  if (segments.length !== segmentIds.length) {
    throw new InvoiceValidationError("Linked flight segments must belong to this travel request.")
  }
}

export async function createInvoiceItems(
  invoiceId: number,
  items: InvoiceItemAttributes[]
): Promise<void> {
  const itemAttributes: CreationAttributes<TravelDeskInvoiceItem>[] = items.map((item) => ({
    travelDeskInvoiceId: invoiceId,
    travelDeskProductTypeId: item.travelDeskProductTypeId,
    travelDeskFlightSegmentId: item.travelDeskFlightSegmentId ?? null,
    sourceAirSegmentNumber: item.sourceAirSegmentNumber ?? null,
    sourceServiceFeeEventId: item.sourceServiceFeeEventId ?? null,
    passengerName: item.passengerName ?? null,
    ticketNumber: item.ticketNumber ?? null,
    vendor: item.vendor ?? null,
    description: item.description ?? null,
    saleType: item.saleType,
    grossAmount: item.grossAmount,
    position: item.position,
  }))

  await TravelDeskInvoiceItem.bulkCreate(itemAttributes, { validate: true })
}
