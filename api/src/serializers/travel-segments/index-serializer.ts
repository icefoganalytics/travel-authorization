import { isNil, pick } from "lodash"

import { TravelSegment, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelSegmentIndexView = Pick<
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

export class IndexSerializer extends BaseSerializer<TravelSegment> {
  constructor(
    protected record: TravelSegment,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelSegmentIndexView {
    const departureTime = this.stripSeconds(this.record.departureTime)
    return {
      ...pick(this.record, [
        "id",
        "travelAuthorizationId",
        "isActual",
        "departureLocationId",
        "arrivalLocationId",
        "segmentNumber",
        "departureOn",
        "modeOfTransport",
        "modeOfTransportOther",
        "accommodationType",
        "accommodationTypeOther",
        "createdAt",
        "updatedAt",
      ]),
      departureTime,
    }
  }

  private stripSeconds(time: string | null): string | null {
    if (isNil(time)) return null

    return time.split(":").slice(0, 2).join(":")
  }
}

export default IndexSerializer
