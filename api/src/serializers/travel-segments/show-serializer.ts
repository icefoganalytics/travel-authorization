import { pick } from "lodash"

import { TravelSegment, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelSegmentShowView = Pick<
  TravelSegment,
  | "id"
  | "travelAuthorizationId"
  | "isActual"
  | "departureLocationId"
  | "arrivalLocationId"
  | "segmentNumber"
  | "departureOn"
  | "departureTime"
  | "modeOfTransport"
  | "modeOfTransportOther"
  | "accommodationType"
  | "accommodationTypeOther"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<TravelSegment> {
  constructor(
    protected record: TravelSegment,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelSegmentShowView {
    return pick(this.record, [
      "id",
      "travelAuthorizationId",
      "isActual",
      "departureLocationId",
      "arrivalLocationId",
      "segmentNumber",
      "departureOn",
      "departureTime",
      "modeOfTransport",
      "modeOfTransportOther",
      "accommodationType",
      "accommodationTypeOther",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default ShowSerializer
