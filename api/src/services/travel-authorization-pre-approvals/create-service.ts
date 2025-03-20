import { CreationAttributes } from "sequelize"

import { isNil } from "lodash"

import { TravelAuthorizationPreApproval, User } from "@/models"
import BaseService from "@/services/base-service"

type TravelAuthorizationPreApprovalCreationAttributes = Partial<
  CreationAttributes<TravelAuthorizationPreApproval>
>

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelAuthorizationPreApprovalCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApproval> {
    const { estimatedCost, location, ...optionalAttributes } = this.attributes

    if (isNil(estimatedCost)) {
      throw new Error("Estimated cost is required.")
    }

    if (isNil(location)) {
      throw new Error("Location is required.")
    }

    const travelAuthorizationPreApproval = await TravelAuthorizationPreApproval.create({
      ...optionalAttributes,
      estimatedCost,
      location,
    })

    return travelAuthorizationPreApproval
  }
}

export default CreateService
