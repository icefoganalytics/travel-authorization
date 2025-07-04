import { pick } from "lodash"

import { TravelDeskOtherTransportation, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskOtherTransportationIndexView = Pick<
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
  constructor(protected record: TravelDeskOtherTransportation, protected currentUser: User) {
    super(record)
  }

  perform(): TravelDeskOtherTransportationIndexView {
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
