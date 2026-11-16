import { CreationAttributes, Op } from "@sequelize/core"
import { isUndefined } from "lodash"

import db from "@/db/db-client"
import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"
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
    const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId, {
      rejectOnEmpty: true,
    })
    if (
      travelAuthorization.status ===
      TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED
    ) {
      return db.transaction(async () => {
        await travelAuthorization.reload({ lock: true })
        await this.travelSegment.reload()
        const policy = new TravelAuthorizationsPolicy(this.currentUser, travelAuthorization)
        if (
          travelAuthorization.status !==
            TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED ||
          !policy.update() ||
          !this.travelSegment.isActual
        ) {
          throw new Error("You are not authorized to correct this primary destination.")
        }

        if (
          Object.keys(this.attributes).some((key) => key !== "isPrimaryDestination") ||
          typeof this.attributes.isPrimaryDestination !== "boolean"
        ) {
          throw new Error("Only the primary destination marker can be corrected on a returned claim.")
        }

        if (this.attributes.isPrimaryDestination) {
          const previousSelectedSegment = await TravelSegment.findOne({
            where: {
              travelAuthorizationId,
              id: { [Op.ne]: this.travelSegment.id },
              isActual: true,
              isPrimaryDestination: true,
            },
          })
          await previousSelectedSegment?.update({ isPrimaryDestination: false })
        }

        return this.travelSegment.update({
          isPrimaryDestination: this.attributes.isPrimaryDestination,
        })
      })
    }

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
      const travelSegments = await TravelSegment.findAll({
        where: {
          travelAuthorizationId,
          isActual,
        },
      })
      if (!travelSegments.some(({ isPrimaryDestination }) => isPrimaryDestination)) {
        const tripType = isActual
          ? travelAuthorization.tripTypeActual
          : travelAuthorization.tripTypeEstimate
        const travelSegmentAttributes = this.travelSegment.get()
        const updatedTravelSegment = {
          ...travelSegmentAttributes,
          ...attributes,
        }
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
