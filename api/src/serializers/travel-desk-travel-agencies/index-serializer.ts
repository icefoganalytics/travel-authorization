import { pick } from "lodash"

import { TravelDeskTravelAgency } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskTravelAgencyAsIndex = Pick<
  TravelDeskTravelAgency,
  "id" | "agencyName" | "contactName" | "contactEmail" | "contactPhoneNumber" | "agencyInfo"
>

export class IndexSerializer extends BaseSerializer<TravelDeskTravelAgency> {
  perform(): TravelDeskTravelAgencyAsIndex {
    return {
      ...pick(this.record, [
        "id",
        "agencyName",
        "contactName",
        "contactEmail",
        "contactPhoneNumber",
        "agencyInfo",
      ]),
    }
  }
}

export default IndexSerializer
