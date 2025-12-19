import { isEmpty, isNil, isUndefined } from "lodash"

import { Expense, TravelAuthorization, User } from "@/models"
import BaseService from "@/services/base-service"

export type RejectionAttributes = Partial<Pick<Expense, "rejectionNote">>

export class RejectService extends BaseService {
  constructor(
    private expense: Expense,
    private attributes: RejectionAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Expense> {
    const { travelAuthorization } = this.expense
    if (isUndefined(travelAuthorization)) {
      throw new Error("Expected travel authorization association to be preloaded")
    }

    if (travelAuthorization.status !== TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED) {
      throw new Error("The parent travel authorization must be approved before expenses can be rejected.")
    }

    if (!isNil(this.expense.rejectedAt)) {
      throw new Error("This expense has already been rejected.")
    }

    const { rejectionNote } = this.attributes
    if (isNil(rejectionNote) || isEmpty(rejectionNote)) {
      throw new Error("Rejection note is required.")
    }

    await this.expense.update({
      rejectedAt: new Date(),
      rejectorId: this.currentUser.id,
      rejectionNote,
    })

    return this.expense.reload({
      include: ["receipt"],
    })
  }
}

export default RejectService
