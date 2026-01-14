import { pick } from "lodash"

import { TravelDeskRentalCar, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskRentalCarAsShow = Pick<
  TravelDeskRentalCar,
  | "id"
  | "travelRequestId"
  | "pickUpCity"
  | "pickUpLocation"
  | "pickUpLocationOther"
  | "dropOffCity"
  | "dropOffLocation"
  | "dropOffLocationOther"
  | "sameDropOffLocation"
  | "matchFlightTimes"
  | "vehicleTypeChangeIndicator"
  | "vehicleType"
  | "vehicleChangeRationale"
  | "pickUpDate"
  | "dropOffDate"
  | "additionalNotes"
  | "status"
  | "reservedVehicleInfo"
  | "booking"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<TravelDeskRentalCar> {
  constructor(protected record: TravelDeskRentalCar, protected currentUser: User) {
    super(record)
  }

  perform(): TravelDeskRentalCarAsShow {
    return {
      ...pick(this.record, [
        "id",
        "travelRequestId",
        "pickUpCity",
        "pickUpLocation",
        "pickUpLocationOther",
        "dropOffCity",
        "dropOffLocation",
        "dropOffLocationOther",
        "sameDropOffLocation",
        "matchFlightTimes",
        "vehicleTypeChangeIndicator",
        "vehicleType",
        "vehicleChangeRationale",
        "pickUpDate",
        "dropOffDate",
        "additionalNotes",
        "status",
        "reservedVehicleInfo",
        "booking",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
