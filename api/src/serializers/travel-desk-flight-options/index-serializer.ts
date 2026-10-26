import { isUndefined, pick } from "lodash"

import { TravelDeskFlightOption } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { IndexSerializer as FlightSegmentIndexSerializer } from "@/serializers/travel-desk-flight-segments"
import type { TravelDeskFlightSegmentAsIndex } from "@/serializers/travel-desk-flight-segments/index-serializer"

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
  flightSegments: TravelDeskFlightSegmentAsIndex[]
}

export class IndexSerializer extends BaseSerializer<TravelDeskFlightOption> {
  perform(): TravelDeskFlightOptionAsIndex {
    const { flightSegments } = this.record
    if (isUndefined(flightSegments)) {
      throw new Error("Expected flightSegments association to be pre-loaded.")
    }

    const serializedFlightSegments = FlightSegmentIndexSerializer.perform(flightSegments)

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
