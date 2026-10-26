import { pick } from "lodash"

import { TravelDeskFlightOption } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskFlightOptionAsShow = Pick<
  TravelDeskFlightOption,
  | "id"
  | "flightRequestId"
  | "travelerId"
  | "cost"
  | "leg"
  | "duration"
  | "flightPreferenceOrder"
  | "additionalInformation"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<TravelDeskFlightOption> {
  perform(): TravelDeskFlightOptionAsShow {
    return {
      ...pick(this.record, [
        "id",
        "flightRequestId",
        "travelerId",
        "cost",
        "leg",
        "duration",
        "flightPreferenceOrder",
        "additionalInformation",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
