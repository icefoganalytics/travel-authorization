import { isEmpty, isNil } from "lodash"

import db from "@/db/db-client"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

import BaseService from "@/services/base-service"

export class SendBackToSupervisorService extends BaseService {
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
        "Travel authorization must be in expense claim approved state to send back to supervisor."
      )
    }

    if (isNil(this.sendbackReason) || isEmpty(this.sendbackReason)) {
      throw new Error("Send back reason is required to send expense claim back to supervisor.")
    }

    const { supervisorEmail } = this.travelAuthorization
    if (isNil(supervisorEmail)) {
      throw new Error(
        "Travel authorization must have a supervisor email to send back to supervisor."
      )
    }

    const supervisor = await User.findOne({
      where: {
        email: supervisorEmail,
      },
    })
    if (isNil(supervisor)) {
      throw new Error("Could not find supervisor user for this travel authorization.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        requestChange: this.sendbackReason,
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
        wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: supervisor.id,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
        note: this.sendbackReason,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default SendBackToSupervisorService
