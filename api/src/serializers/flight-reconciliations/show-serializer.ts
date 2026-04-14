import { pick } from "lodash"

import { FlightReconciliation, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type FlightReconciliationAsShow = Pick<
  FlightReconciliation,
  | "id"
  | "reconcilerId"
  | "externalTravComIdentifier"
  | "invoiceBookingDate"
  | "invoiceDepartmentMailcode"
  | "invoiceDetailSellingFare"
  | "invoiceDetailComputedAgentName"
  | "invoiceDetailVendorName"
  | "invoiceDetailComputedTravelerFirstName"
  | "invoiceDetailComputedTravelerLastName"
  | "segmentsComputedFlightInfo"
  | "segmentsComputedFinalDestination"
  | "reconciled"
  | "reconcilePeriod"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<FlightReconciliation> {
  constructor(
    protected record: FlightReconciliation,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): FlightReconciliationAsShow {
    return pick(this.record, [
      "id",
      "reconcilerId",
      "externalTravComIdentifier",
      "invoiceBookingDate",
      "invoiceDepartmentMailcode",
      "invoiceDetailSellingFare",
      "invoiceDetailComputedAgentName",
      "invoiceDetailVendorName",
      "invoiceDetailComputedTravelerFirstName",
      "invoiceDetailComputedTravelerLastName",
      "segmentsComputedFlightInfo",
      "segmentsComputedFinalDestination",
      "reconciled",
      "reconcilePeriod",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default ShowSerializer
