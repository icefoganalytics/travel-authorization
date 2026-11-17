import { Attributes } from "@sequelize/core"

import { TravelAuthorization, User } from "@/models"

import BaseService from "@/services/base-service"

export class UpdateService extends BaseService {
  constructor(
    protected travelAuthorization: TravelAuthorization,
    protected attributes: Partial<Attributes<TravelAuthorization>>,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorization> {
    await this.travelAuthorization.update(this.attributes)
    return this.travelAuthorization
  }
}

export default UpdateService
