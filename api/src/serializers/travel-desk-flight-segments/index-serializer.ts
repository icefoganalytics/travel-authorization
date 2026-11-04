import { pick } from "lodash"

import { TravelDeskFlightSegment } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskFlightSegmentAsIndex = Pick<
  TravelDeskFlightSegment,
  | "id"
  | "flightOptionId"
  | "flightNumber"
  | "departAt"
  | "departLocation"
  | "arriveAt"
  | "arriveLocation"
  | "duration"
  | "status"
  | "class"
  | "sortOrder"
  | "createdAt"
  | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<TravelDeskFlightSegment> {
  perform(): TravelDeskFlightSegmentAsIndex {
    return {
      ...pick(this.record, [
        "id",
        "flightOptionId",
        "flightNumber",
        "departAt",
        "departLocation",
        "arriveAt",
        "arriveLocation",
        "duration",
        "status",
        "class",
        "sortOrder",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default IndexSerializer
