import { isUndefined, pick } from "lodash"

import { TravelDeskFlightRequest } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { TravelDeskFlightOptions } from "@/serializers"

export type TravelDeskFlightRequestAsIndex = Pick<
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
> & {
  flightOptions: TravelDeskFlightOptions.AsIndex[]
}

export class IndexSerializer extends BaseSerializer<TravelDeskFlightRequest> {
  perform(): TravelDeskFlightRequestAsIndex {
    const { flightOptions } = this.record
    if (isUndefined(flightOptions)) {
      throw new Error("Expected flightOptions association to be preloaded.")
    }

    const serializedFlightOptions = TravelDeskFlightOptions.IndexSerializer.perform(flightOptions)

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
      flightOptions: serializedFlightOptions,
    }
  }
}

export default IndexSerializer
