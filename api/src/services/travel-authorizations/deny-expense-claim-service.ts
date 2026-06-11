import db from "@/db/db-client"

import BaseService from "@/services/base-service"
import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"
import { type TravelAuthorizationStatuses } from "@/models/travel-authorization"

export class DenyExpenseClaimService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private denialReason: string | null
  private denier: User

  constructor(travelAuthorization: TravelAuthorization, denialReason: string | null, denier: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.denialReason = denialReason
    this.denier = denier
  }

  async perform(): Promise<TravelAuthorization> {
    if (
      ![
        TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
        TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
      ].includes(this.travelAuthorization.status as TravelAuthorizationStatuses)
    ) {
      throw new Error(
        "Travel authorization must be in expense claim submitted, approved, or supervisor changes requested state to deny expense claim."
      )
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        denialReason: this.denialReason,
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_DENIED,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.denier.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_DENIED,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default DenyExpenseClaimService
