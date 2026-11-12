import { Attributes } from "@sequelize/core"

import { isNil, isUndefined } from "lodash"

import { TravelAuthorization, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"
import { defaultPrimaryDestinationSegment } from "@/services/travel-segments/default-primary-destination-segment"

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
    if (isUndefined(attributes.isPrimaryDestination)) {
      const isActual = attributes.isActual ?? false
      const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId, {
        rejectOnEmpty: true,
      })
      const travelSegments = await TravelSegment.findAll({
        where: { travelAuthorizationId, isActual },
      })
      if (!travelSegments.some(({ isPrimaryDestination }) => isPrimaryDestination)) {
        const tripType = isActual
          ? travelAuthorization.tripTypeActual
          : travelAuthorization.tripTypeEstimate
        const defaultSegment = defaultPrimaryDestinationSegment(tripType, [
          ...travelSegments,
          attributes,
        ])
        attributes.isPrimaryDestination = defaultSegment === attributes
      }
    }

    const travelSegment = await TravelSegment.create(attributes)

    return travelSegment
  }
}

export default CreateService
