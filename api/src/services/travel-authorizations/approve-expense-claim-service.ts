import db from "@/db/db-client"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"
import { type TravelAuthorizationStatuses } from "@/models/travel-authorization"

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
    if (
      ![
        TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
      ].includes(this.travelAuthorization.status as TravelAuthorizationStatuses)
    ) {
      throw new Error(
        "Travel authorization must be in expense claim submitted or expense claim supervisor changes requested state to approve."
      )
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
        wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.approver.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_APPROVED,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default ApproveExpenseClaimService
