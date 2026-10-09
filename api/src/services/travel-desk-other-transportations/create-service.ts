import { isNil } from "lodash"

import { TravelDeskOtherTransportation, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskOtherTransportation>

export class CreateService extends BaseService {
  constructor(
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskOtherTransportation> {
    const { travelRequestId, depart, arrive, transportationType, date, ...optionalAttributes } =
      this.attributes

    if (isNil(travelRequestId)) {
      throw new Error("Travel request ID is required.")
    }

    if (isNil(depart)) {
      throw new Error("Depart is required.")
    }

    if (isNil(arrive)) {
      throw new Error("Arrive is required.")
    }

    if (isNil(transportationType)) {
      throw new Error("Transportation type is required.")
    }

    if (isNil(date)) {
      throw new Error("Date is required.")
    }

    return TravelDeskOtherTransportation.create({
      travelRequestId,
      depart,
      arrive,
      transportationType,
      date,
      ...optionalAttributes,
      status: TravelDeskOtherTransportation.Statuses.REQUESTED,
    })
  }
}

export default CreateService
