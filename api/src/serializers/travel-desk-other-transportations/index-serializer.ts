import { pick } from "lodash"

import { TravelDeskOtherTransportation } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskOtherTransportationAsIndex = Pick<
  TravelDeskOtherTransportation,
  | "id"
  | "travelRequestId"
  | "depart"
  | "arrive"
  | "transportationType"
  | "date"
  | "additionalNotes"
  | "reservedTransportationInfo"
  | "booking"
  | "status"
  | "createdAt"
  | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<TravelDeskOtherTransportation> {
  perform(): TravelDeskOtherTransportationAsIndex {
    return {
      ...pick(this.record, [
        "id",
        "travelRequestId",
        "depart",
        "arrive",
        "transportationType",
        "date",
        "additionalNotes",
        "reservedTransportationInfo",
        "booking",
        "status",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default IndexSerializer
