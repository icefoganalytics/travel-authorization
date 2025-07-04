import { Attributes } from "@sequelize/core"

import { PerDiem, User } from "@/models"
import BaseService from "@/services/base-service"

type PerDiemUpdateAttributes = Partial<Attributes<PerDiem>>

export class UpdateService extends BaseService {
  constructor(
    protected perDiem: PerDiem,
    protected attributes: PerDiemUpdateAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<PerDiem> {
    return this.perDiem.update(this.attributes)
  }
}

export default UpdateService
