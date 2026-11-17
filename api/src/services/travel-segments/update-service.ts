import { CreationAttributes } from "@sequelize/core"

import db from "@/db/db-client"
import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"
import { ReconcilePrimaryDestinationService } from "@/services/travel-authorizations/reconcile-primary-destination-service"

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
    return db.transaction(async () => {
      const { travelAuthorizationId } = this.travelSegment
      const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId, {
        rejectOnEmpty: true,
        lock: true,
      })
      if (
        travelAuthorization.status ===
        TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED
      ) {
        throw new Error("Travel segments cannot be updated on a returned expense claim.")
      }

      const numberOfExpenses = await Expense.count({
        where: {
          type: Expense.Types.EXPENSE,
          travelAuthorizationId,
        },
      })
      if (numberOfExpenses > 0) {
        throw new Error(
          "Travel segment can no longer be updated once there are dependent expenses."
        )
      }

      const travelSegment = await this.travelSegment.update(this.attributes)
      await ReconcilePrimaryDestinationService.perform(travelAuthorization, travelSegment.isActual)
      return travelSegment
    })
  }
}

export default UpdateService
