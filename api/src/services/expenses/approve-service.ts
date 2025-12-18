import { isNil, isUndefined } from "lodash"

import { Expense, TravelAuthorization, User } from "@/models"
import BaseService from "@/services/base-service"

export class ApproveService extends BaseService {
  constructor(
    private expense: Expense,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Expense> {
    const { travelAuthorization } = this.expense
    if (isUndefined(travelAuthorization)) {
      throw new Error("Expected travel authorization associatoin to be preloaded")
    }

    if (travelAuthorization.status !== TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED) {
      throw new Error("The parent travel authorization must be approved before expenses can be approved.")
    }

    if (!isNil(this.expense.approvedAt)) {
      throw new Error("This expense has already been approved.")
    }

    await this.expense.update({
      approverId: this.currentUser.id,
      approvedAt: new Date(),
    })

    return this.expense.reload({
      include: ["receipt"],
    })
  }
}

export default ApproveService
