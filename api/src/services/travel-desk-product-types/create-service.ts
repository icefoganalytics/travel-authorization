import { TravelDeskProductType, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Pick<TravelDeskProductType, "code" | "name" | "description">

export class CreateService extends BaseService {
  constructor(
    protected attributes: Partial<Attributes>,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskProductType> {
    const code = this.attributes.code?.trim()
    const name = this.attributes.name?.trim()
    const description = this.attributes.description?.trim() ?? null

    if (code == null || name == null || code.length === 0 || name.length === 0) {
      throw new Error("Code and name are required.")
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code)) {
      throw new Error("Code must be kebab-case.")
    }

    return TravelDeskProductType.create({
      code,
      name,
      description,
    })
  }
}
export default CreateService
