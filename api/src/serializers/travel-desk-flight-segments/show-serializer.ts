import { pick } from "lodash"

import { TravelDeskFlightSegment } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskFlightSegmentAsShow = Pick<
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

export class ShowSerializer extends BaseSerializer<TravelDeskFlightSegment> {
  perform(): TravelDeskFlightSegmentAsShow {
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

export default ShowSerializer
