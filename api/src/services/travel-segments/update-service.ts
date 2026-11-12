import { CreationAttributes } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"
import { defaultPrimaryDestinationSegment } from "@/services/travel-segments/helpers/default-primary-destination-segment"

type TravelSegmentCreationAttributes = Partial<CreationAttributes<TravelSegment>>

export class UpdateService extends BaseService {
  constructor(
    protected travelSegment: TravelSegment,
    protected attributes: TravelSegmentCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelSegment> {
    const { travelAuthorizationId } = this.travelSegment

    const numberOfExpenses = await Expense.count({
      where: {
        type: Expense.Types.EXPENSE,
        travelAuthorizationId,
      },
    })
    if (numberOfExpenses > 0) {
      throw new Error("Travel segment can no longer be updated once there are dependent expenses.")
    }

    const attributes = { ...this.attributes }
    if (
      !isUndefined(attributes.arrivalLocationId) &&
      attributes.arrivalLocationId !== this.travelSegment.arrivalLocationId &&
      isUndefined(attributes.isPrimaryDestination)
    ) {
      attributes.isPrimaryDestination = false
    } else if (
      isUndefined(attributes.isPrimaryDestination) &&
      !this.travelSegment.isPrimaryDestination
    ) {
      const { isActual } = this.travelSegment
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
        const travelSegmentAttributes = this.travelSegment.get()
        const updatedTravelSegment = { ...travelSegmentAttributes, ...attributes }
        const otherTravelSegments = travelSegments.filter(({ id }) => id !== this.travelSegment.id)
        const defaultSegment = defaultPrimaryDestinationSegment(tripType, [
          ...otherTravelSegments,
          updatedTravelSegment,
        ])
        attributes.isPrimaryDestination = defaultSegment === updatedTravelSegment
      }
    }

    const travelSegment = await this.travelSegment.update({
      ...attributes,
    })

    return travelSegment
  }
}

export default UpdateService
