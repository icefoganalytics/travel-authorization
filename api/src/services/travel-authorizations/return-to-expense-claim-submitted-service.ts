import { isEmpty, isNil } from "lodash"

import db from "@/db/db-client"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

import BaseService from "@/services/base-service"

export class ReturnToExpenseClaimSubmittedService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private sendbackReason: string | null
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    sendbackReason: string | null,
    currentUser: User
  ) {
    super()
    this.travelAuthorization = travelAuthorization
    this.sendbackReason = sendbackReason
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED) {
      throw new Error(
        "Travel authorization must be in expense claim approved state to return to submitted."
      )
    }

    if (isNil(this.sendbackReason) || isEmpty(this.sendbackReason)) {
      throw new Error("Send back reason is required to return expense claim to submitted.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        requestChange: this.sendbackReason,
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_SUBMITTED,
        note: this.sendbackReason,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default ReturnToExpenseClaimSubmittedService
