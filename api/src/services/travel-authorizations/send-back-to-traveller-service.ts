import { isEmpty, isNil } from "lodash"

import db from "@/db/db-client"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"
import type { TravelAuthorizationStatuses } from "@/models/travel-authorization"

import BaseService from "@/services/base-service"

export class SendBackToTravellerService extends BaseService {
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
    if (
      ![
        TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
      ].includes(this.travelAuthorization.status as TravelAuthorizationStatuses)
    ) {
      throw new Error(
        "Travel authorization must be in expense claim submitted or approved state to send back to traveller."
      )
    }

    if (isNil(this.requestChange) || isEmpty(this.requestChange)) {
      throw new Error("Reason is required to send expense claim back to traveller.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        requestChange: this.requestChange,
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        wizardStepName: TravelAuthorization.WizardStepNames.SUBMIT_EXPENSES,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        note: this.requestChange,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default SendBackToTravellerService
