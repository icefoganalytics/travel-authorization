import db, { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"
import BaseService from "@/services/base-service"

export class ExpenseService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private currentUser: User

  constructor(travelAuthorization: TravelAuthorization, currentUser: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED) {
      throw new Error("Travel authorization must be in expense claim approved state to complete.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        status: TravelAuthorization.Statuses.EXPENSED,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.EXPENSED,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default ExpenseService
