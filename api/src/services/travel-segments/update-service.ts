import { CreationAttributes } from "sequelize"

import { Expense, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"

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

    const travelSegment = await this.travelSegment.update({
      ...this.attributes,
    })

    return travelSegment
  }
}

export default UpdateService
