import { pick } from "lodash"

import { TravelDeskHotel } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskHotelAsShow = Pick<
  TravelDeskHotel,
  | "id"
  | "travelRequestId"
  | "city"
  | "isDedicatedConferenceHotelAvailable"
  | "conferenceName"
  | "conferenceHotelName"
  | "checkIn"
  | "checkOut"
  | "additionalInformation"
  | "status"
  | "reservedHotelInfo"
  | "booking"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<TravelDeskHotel> {
  perform(): TravelDeskHotelAsShow {
    return {
      ...pick(this.record, [
        "id",
        "travelRequestId",
        "city",
        "isDedicatedConferenceHotelAvailable",
        "conferenceName",
        "conferenceHotelName",
        "checkIn",
        "checkOut",
        "additionalInformation",
        "status",
        "reservedHotelInfo",
        "booking",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
