import { isNil } from "lodash"

import { TravelDeskProductType, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Pick<TravelDeskProductType, "name" | "description">

export class UpdateService extends BaseService {
  constructor(
    protected productType: TravelDeskProductType,
    protected attributes: Partial<Attributes>,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskProductType> {
    const attributes = { ...this.attributes }
    if (attributes.name !== undefined) {
      const name = attributes.name?.trim()
      if (isNil(name) || name.length === 0) {
        throw new Error("Name is required.")
      }

      attributes.name = name
    }

    if (attributes.description !== undefined) {
      attributes.description = attributes.description?.trim() ?? null
    }

    return this.productType.update(attributes)
  }
}

export default UpdateService
