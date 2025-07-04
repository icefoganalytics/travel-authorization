import { Attributes } from "@sequelize/core"

import { TravelAllowance, User } from "@/models"
import BaseService from "@/services/base-service"

type TravelAllowanceUpdateAttributes = Partial<Attributes<TravelAllowance>>

export class UpdateService extends BaseService {
  constructor(
    protected travelAllowance: TravelAllowance,
    protected attributes: TravelAllowanceUpdateAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAllowance> {
    return this.travelAllowance.update(this.attributes)
  }
}

export default UpdateService
