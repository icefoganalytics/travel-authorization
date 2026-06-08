import db from "@/db/db-client"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

import BaseService from "@/services/base-service"

export class RequestExpenseClaimChangesService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private currentUser: User

  constructor(travelAuthorization: TravelAuthorization, currentUser: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED) {
      throw new Error(
        "Travel authorization must be in expense claim submitted state to request changes."
      )
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_CHANGES_REQUESTED,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_CHANGES_REQUESTED,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default RequestExpenseClaimChangesService