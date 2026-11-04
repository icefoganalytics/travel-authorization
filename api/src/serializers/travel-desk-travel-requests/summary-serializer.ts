import { pick } from "lodash"

import { TravelDeskTravelRequest } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskTravelRequestAsSummary = Pick<
  TravelDeskTravelRequest,
  "id" | "status" | "invoiceNumber"
>

export class SummarySerializer extends BaseSerializer<TravelDeskTravelRequest> {
  perform(): TravelDeskTravelRequestAsSummary {
    return pick(this.record, ["id", "status", "invoiceNumber"])
  }
}

export default SummarySerializer
