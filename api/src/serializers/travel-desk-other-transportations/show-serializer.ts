import { pick } from "lodash"

import { TravelDeskOtherTransportation } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskOtherTransportationAsShow = Pick<
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

export class ShowSerializer extends BaseSerializer<TravelDeskOtherTransportation> {
  perform(): TravelDeskOtherTransportationAsShow {
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

export default ShowSerializer
