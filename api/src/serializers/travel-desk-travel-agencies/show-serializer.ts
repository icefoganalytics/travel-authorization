import { pick } from "lodash"

import { TravelDeskTravelAgency } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskTravelAgencyAsShow = Pick<
  TravelDeskTravelAgency,
  "id" | "agencyName" | "contactName" | "contactEmail" | "contactPhoneNumber" | "agencyInfo"
>

export class ShowSerializer extends BaseSerializer<TravelDeskTravelAgency> {
  perform(): TravelDeskTravelAgencyAsShow {
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

export default ShowSerializer
