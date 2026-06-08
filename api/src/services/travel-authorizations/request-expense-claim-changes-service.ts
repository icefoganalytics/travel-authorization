import { isEmpty, isNil } from "lodash"

import db from "@/db/db-client"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

import BaseService from "@/services/base-service"

export class RequestExpenseClaimChangesService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private requestChange: string | null
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    requestChange: string | null,
    currentUser: User
  ) {
    super()
    this.travelAuthorization = travelAuthorization
    this.requestChange = requestChange
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED) {
      throw new Error(
        "Travel authorization must be in expense claim submitted state to request changes."
      )
    }

    if (isNil(this.requestChange) || isEmpty(this.requestChange)) {
      throw new Error("Request change reason is required.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        requestChange: this.requestChange,
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_CHANGES_REQUESTED,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_CHANGES_REQUESTED,
        note: this.requestChange,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default RequestExpenseClaimChangesService
