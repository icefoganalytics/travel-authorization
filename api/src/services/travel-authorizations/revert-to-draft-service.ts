import db from "@/db/db-client"

import BaseService from "@/services/base-service"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

export class RevertToDraftService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private currentUser: User

  constructor(travelAuthorization: TravelAuthorization, currentUser: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.SUBMITTED) {
      throw new Error("Travel authorization must be in submitted state to revert to draft.")
    }

    await db.transaction(async () => {
      this.travelAuthorization.update({
        status: TravelAuthorization.Statuses.DRAFT,
      })

      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: this.currentUser.id,
        action: TravelAuthorizationActionLog.Actions.DRAFT,
        note: "Reverted to draft",
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default RevertToDraftService
