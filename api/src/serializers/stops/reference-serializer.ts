import { isNil, pick } from "lodash"

import { Stop } from "@/models"

import BaseSerializer from "@/serializers/base-serializer"

export type StopAsReference = Pick<
  Stop,
  | "id"
  | "travelAuthorizationId"
  | "locationId"
  | "departureDate"
  | "transport"
  | "accommodationType"
  | "isActual"
  | "createdAt"
  | "updatedAt"
> & {
  departureTime: string | null
}

export class ReferenceSerializer extends BaseSerializer<Stop> {
  perform(): StopAsReference {
    return {
      ...pick(this.record, [
        "id",
        "travelAuthorizationId",
        "locationId",
        "departureDate",
        "transport",
        "accommodationType",
        "isActual",
        "createdAt",
        "updatedAt",
      ]),
      departureTime: this.formatTimeToHHmm(),
    }
  }

  formatTimeToHHmm(): string | null {
    const { departureTime } = this.record
    if (isNil(departureTime)) return null

    return departureTime.split(":").slice(0, 2).join(":")
  }
}

export default ReferenceSerializer
