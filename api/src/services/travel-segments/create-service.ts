import { Attributes } from "sequelize"

import { isNil } from "lodash"

import { TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"

export type TravelSegmentCreationAttributes = Partial<Attributes<TravelSegment>>

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelSegmentCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelSegment> {
    const { travelAuthorizationId, segmentNumber, modeOfTransport, ...optionalAttributes } =
      this.attributes

    if (isNil(travelAuthorizationId)) {
      throw new Error("Travel authorization ID is required.")
    }

    if (isNil(segmentNumber)) {
      throw new Error("Segment number is required.")
    }

    if (isNil(modeOfTransport)) {
      throw new Error("Mode of transport is required.")
    }

    const travelSegment = await TravelSegment.create({
      ...optionalAttributes,
      travelAuthorizationId,
      segmentNumber,
      modeOfTransport,
    })

    return travelSegment
  }
}

export default CreateService
