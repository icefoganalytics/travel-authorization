import { pick } from "lodash"

import { FlightReconciliation, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type FlightReconciliationAsIndex = Pick<
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

export class IndexSerializer extends BaseSerializer<FlightReconciliation> {
  constructor(
    protected record: FlightReconciliation,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): FlightReconciliationAsIndex {
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

export default IndexSerializer
