import { isUndefined, pick } from "lodash"

import { TravelDeskFlightRequest } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { IndexSerializer as FlightOptionIndexSerializer } from "@/serializers/travel-desk-flight-options"
import type { TravelDeskFlightOptionAsIndex } from "@/serializers/travel-desk-flight-options/index-serializer"

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
  flightOptions: TravelDeskFlightOptionAsIndex[]
}

export class IndexSerializer extends BaseSerializer<TravelDeskFlightRequest> {
  perform(): TravelDeskFlightRequestAsIndex {
    const { flightOptions } = this.record
    if (isUndefined(flightOptions)) {
      throw new Error("Expected flightOptions association to be pre-loaded.")
    }

    const serializedFlightOptions = FlightOptionIndexSerializer.perform(flightOptions)

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
