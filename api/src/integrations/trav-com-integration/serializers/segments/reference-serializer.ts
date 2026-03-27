import { isNil, isUndefined, pick } from "lodash"

import guessNameCapitalization from "@/integrations/trav-com-integration/utils/guess-name-capitalization"

import { Segment } from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type SegmentAsReference = Pick<
  Segment,
  | "id"
  | "invoiceId"
  | "invoiceDetailId"
  | "legNumber"
  | "departureCityCode"
  | "departureInfo"
  | "arrivalCityCode"
  | "arrivalInfo"
  | "airlineCode"
  | "flightNumber"
  | "classOfService"
  | "fareBasis"
> & {
  departureCityName: string | null
  arrivalCityName: string | null
}

export class ReferenceSerializer extends BaseSerializer<Segment> {
  perform(): SegmentAsReference {
    const { departureCity, arrivalCity } = this.record
    if (isUndefined(departureCity)) {
      throw new Error("Expected 'departureCity' association to be pre-loaded")
    }

    if (isUndefined(arrivalCity)) {
      throw new Error("Expected 'arrivalCity' association to be pre-loaded")
    }

    return {
      ...pick(this.record, [
        "id",
        "invoiceId",
        "invoiceDetailId",
        "legNumber",
        "departureCityCode",
        "departureInfo",
        "arrivalCityCode",
        "arrivalInfo",
        "airlineCode",
        "flightNumber",
        "classOfService",
        "fareBasis",
      ]),
      departureCityName: this.formatCityName(departureCity?.cityName),
      arrivalCityName: this.formatCityName(arrivalCity?.cityName),
    }
  }

  private formatCityName(cityName: string | null | undefined): string | null {
    if (isNil(cityName)) {
      return null
    }

    return guessNameCapitalization(cityName)
  }
}

export default ReferenceSerializer
