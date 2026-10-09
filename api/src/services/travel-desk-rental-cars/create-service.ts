import { isNil } from "lodash"

import { TravelDeskRentalCar, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskRentalCar>

export class CreateService extends BaseService {
  constructor(
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskRentalCar> {
    const {
      travelRequestId,
      pickUpCity,
      pickUpLocation,
      vehicleType,
      vehicleChangeRationale,
      pickUpDate,
      dropOffDate,
      ...optionalAttributes
    } = this.attributes

    if (isNil(travelRequestId)) {
      throw new Error("Travel request ID is required.")
    }

    if (isNil(pickUpCity)) {
      throw new Error("Pick-up city is required.")
    }

    if (isNil(pickUpLocation)) {
      throw new Error("Pick-up location is required.")
    }

    if (isNil(vehicleType)) {
      throw new Error("Vehicle type is required.")
    }

    if (isNil(pickUpDate)) {
      throw new Error("Pick-up date is required.")
    }

    if (isNil(dropOffDate)) {
      throw new Error("Drop-off date is required.")
    }

    return TravelDeskRentalCar.create({
      travelRequestId,
      pickUpCity,
      pickUpLocation,
      vehicleType,
      vehicleChangeRationale,
      pickUpDate,
      dropOffDate,
      ...optionalAttributes,
      status: TravelDeskRentalCar.Statuses.REQUESTED,
    })
  }
}

export default CreateService
