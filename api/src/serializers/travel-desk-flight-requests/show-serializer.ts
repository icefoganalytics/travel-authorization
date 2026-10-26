import { pick } from "lodash"

import { TravelDeskFlightRequest } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskFlightRequestAsShow = Pick<
  TravelDeskFlightRequest,
  | "id"
  | "travelRequestId"
  | "departLocation"
  | "arriveLocation"
  | "datePreference"
  | "timePreference"
  | "seatPreference"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<TravelDeskFlightRequest> {
  perform(): TravelDeskFlightRequestAsShow {
    return {
      ...pick(this.record, [
        "id",
        "travelRequestId",
        "departLocation",
        "arriveLocation",
        "datePreference",
        "timePreference",
        "seatPreference",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
