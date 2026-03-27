import { pick } from "lodash"

import { TravelDeskHotel, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskHotelAsIndex = Pick<
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

export class IndexSerializer extends BaseSerializer<TravelDeskHotel> {
  constructor(protected record: TravelDeskHotel, protected currentUser: User) {
    super(record)
  }

  perform(): TravelDeskHotelAsIndex {
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

export default IndexSerializer
