import db from "@/db/db-client"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

import BaseService from "@/services/base-service"

export class ApproveExpenseClaimService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private approver: User

  constructor(travelAuthorization: TravelAuthorization, approver: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.approver = approver
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED) {
      throw new Error("Travel authorization must be in expense claim submitted state to approve.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        status: TravelAuthorization.Statuses.AWAITING_FINANCE_REVIEW_AND_PROCESSING,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.approver.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.AWAITING_FINANCE_REVIEW_AND_PROCESSING,
      })
    })

    return this.travelAuthorization.reload({ include: ["expenses", "stops", "purpose", "user"] })
  }
}

export default ApproveExpenseClaimService
