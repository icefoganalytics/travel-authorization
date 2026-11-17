import { Attributes } from "@sequelize/core"

import db from "@/db/db-client"
import { TravelAuthorization, User } from "@/models"

import BaseService from "@/services/base-service"
import ValidatePrimaryDestinationService from "@/services/travel-authorizations/validate-primary-destination-service"

export class UpdateService extends BaseService {
  constructor(
    protected travelAuthorization: TravelAuthorization,
    protected attributes: Partial<Attributes<TravelAuthorization>>,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorization> {
    return db.transaction(async () => {
      this.travelAuthorization = await TravelAuthorization.findByPk(this.travelAuthorization.id, {
        rejectOnEmpty: true,
        lock: true,
      })
      this.travelAuthorization.set(this.attributes)
      await ValidatePrimaryDestinationService.perform(this.travelAuthorization)
      await this.travelAuthorization.save()
      return this.travelAuthorization
    })
  }
}

export default UpdateService
