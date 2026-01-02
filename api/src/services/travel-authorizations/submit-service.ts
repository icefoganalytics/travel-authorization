import { isNil } from "lodash"

import db from "@/db/db-client"

import BaseService from "@/services/base-service"
import { Users } from "@/services"
import { UpdateService } from "@/services/travel-authorizations"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

type SubmitServiceAttributes = Partial<TravelAuthorization> & {
  travelAuthorizationActionLogAttributes?: Partial<TravelAuthorizationActionLog>
}

export class SubmitService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private attributes: SubmitServiceAttributes
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    attributes: SubmitServiceAttributes,
    currentUser: User
  ) {
    super()
    this.travelAuthorization = travelAuthorization
    this.attributes = attributes
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.DRAFT) {
      throw new Error("Travel authorization must be in draft state to submit.")
    }

    const { supervisorEmail, travelAuthorizationActionLogAttributes } = this.attributes
    if (isNil(supervisorEmail)) {
      throw new Error("Supervisor email is required for travel authorization submission.")
    }

    await db.transaction(async () => {
      this.travelAuthorization = await UpdateService.perform(
        this.travelAuthorization,
        {
          ...this.attributes,
          status: TravelAuthorization.Statuses.SUBMITTED,
        },
        this.currentUser
      )

      const supervisor = await Users.EnsureService.perform(
        {
          email: supervisorEmail,
        },
        this.currentUser
      ).catch((error) => {
        throw new Error(`Failed to ensure supervisor: ${error}`)
      })

      await TravelAuthorizationActionLog.create({
        ...travelAuthorizationActionLogAttributes,
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: supervisor.id,
        action: TravelAuthorizationActionLog.Actions.SUBMITTED,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }
}

export default SubmitService
