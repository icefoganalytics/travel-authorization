import { isNil, isUndefined } from "lodash"

import db from "@/db/db-client"

import BaseService from "@/services/base-service"
import { Users } from "@/services"
import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"
import { type TravelAuthorizationStatuses } from "@/models/travel-authorization"

// TODO: Rename ExpenseClaimService → SubmitExpenseClaimService and update the full
// pipeline: SubmitExpenseClaimController, SubmitExpenseClaimPolicy, barrel re-exports,
// route POST /expense-claim → /submit-expense-claim, and the test file. The verb "submit"
// aligns with the EXPENSE_CLAIM_SUBMITTED status and action log entry this service produces.
export class ExpenseClaimService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private supervisorEmail: string
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    supervisorEmail: string,
    currentUser: User
  ) {
    super()
    this.travelAuthorization = travelAuthorization
    this.supervisorEmail = supervisorEmail
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (
      ![
        TravelAuthorization.Statuses.APPROVED,
        TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
      ].includes(this.travelAuthorization.status as TravelAuthorizationStatuses)
    ) {
      throw new Error(
        "Travel authorization must be in an approved or expense claim traveller changes requested state to submit an expense claim."
      )
    }

    if (isNil(this.supervisorEmail)) {
      throw new Error("Supervisor email is required for expense claim submission.")
    }

    if (!this.isAfterTravelEndDate()) {
      throw new Error("Can not submit an expense claim before travel is completed.")
    }

    await db.transaction(async () => {
      const supervisor = await Users.EnsureService.perform(
        {
          email: this.supervisorEmail,
        },
        this.currentUser
      ).catch((error) => {
        throw new Error(`Failed to ensure supervisor: ${error}`)
      })

      await this.travelAuthorization.update({
        supervisorEmail: this.supervisorEmail,
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL,
      })
      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: supervisor.id,
        action: TravelAuthorizationActionLog.Actions.EXPENSE_CLAIM_SUBMITTED,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }

  private isAfterTravelEndDate(): boolean {
    const { travelSegments } = this.travelAuthorization
    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded.")
    }

    const lastTravelSegment = travelSegments.at(-1)
    if (isNil(lastTravelSegment)) {
      throw new Error(
        "Cannot check if travel authorization is after travel end date without at least one travel segment."
      )
    }

    const { departureOn } = lastTravelSegment
    if (isNil(departureOn)) {
      throw new Error(
        "Cannot check if travel authorization is after travel end date without a departure date."
      )
    }

    return new Date(departureOn) < new Date()
  }
}

export default ExpenseClaimService
