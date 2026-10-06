import { isNil } from "lodash"

import { TravelDeskFlightRequest, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskFlightRequest>

export class CreateService extends BaseService {
  constructor(
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskFlightRequest> {
    const {
      travelRequestId,
      departLocation,
      arriveLocation,
      datePreference,
      timePreference,
      seatPreference,
    } = this.attributes

    if (isNil(travelRequestId)) {
      throw new Error("Travel request ID is required.")
    }

    if (isNil(departLocation)) {
      throw new Error("Depart location is required.")
    }

    if (isNil(arriveLocation)) {
      throw new Error("Arrive location is required.")
    }

    if (isNil(datePreference)) {
      throw new Error("Date preference is required.")
    }

    if (isNil(timePreference)) {
      throw new Error("Time preference is required.")
    }

    if (isNil(seatPreference)) {
      throw new Error("Seat preference is required.")
    }

    return TravelDeskFlightRequest.create({
      travelRequestId,
      departLocation,
      arriveLocation,
      datePreference,
      timePreference,
      seatPreference,
    })
  }
}

export default CreateService
