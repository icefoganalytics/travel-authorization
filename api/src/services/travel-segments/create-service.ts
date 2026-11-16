import { Attributes } from "@sequelize/core"

import { isNil } from "lodash"

import db, { TravelAuthorization, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"
import { ReconcilePrimaryDestinationService } from "@/services/travel-authorizations/reconcile-primary-destination-service"

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

    const attributes = {
      ...optionalAttributes,
      travelAuthorizationId,
      segmentNumber,
      modeOfTransport,
    }
    return db.transaction(async () => {
      const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId, {
        rejectOnEmpty: true,
        lock: true,
      })
      const travelSegment = await TravelSegment.create(attributes)
      await ReconcilePrimaryDestinationService.perform(travelAuthorization, travelSegment.isActual)
      return travelSegment
    })
  }
}

export default CreateService
