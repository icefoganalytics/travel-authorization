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

    if (
      travelAuthorization.status !==
      TravelAuthorization.Statuses.AWAITING_FINANCE_REVIEW_AND_PROCESSING
    ) {
      throw new Error(
        "This expense must be in the awaiting finance review and processing state to be rejected."
      )
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

    return this.expense
  }
}

export default RejectService
