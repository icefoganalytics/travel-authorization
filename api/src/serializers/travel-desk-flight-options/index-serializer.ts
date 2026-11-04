import { isUndefined, pick } from "lodash"

import { TravelDeskFlightOption } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { TravelDeskFlightSegments } from "@/serializers"

export type TravelDeskFlightOptionAsIndex = Pick<
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
> & {
  flightSegments: TravelDeskFlightSegments.AsIndex[]
}

export class IndexSerializer extends BaseSerializer<TravelDeskFlightOption> {
  perform(): TravelDeskFlightOptionAsIndex {
    const { flightSegments } = this.record
    if (isUndefined(flightSegments)) {
      throw new Error("Expected flightSegments association to be preloaded.")
    }

    const serializedFlightSegments =
      TravelDeskFlightSegments.IndexSerializer.perform(flightSegments)

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
      flightSegments: serializedFlightSegments,
    }
  }
}

export default IndexSerializer
