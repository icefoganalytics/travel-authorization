import { CreationAttributes } from "@sequelize/core"

import { isNil } from "lodash"

import { TravelAuthorizationPreApprovalProfile, User } from "@/models"
import BaseService from "@/services/base-service"

type TravelAuthorizationPreApprovalProfileCreationAttributes = Partial<
  CreationAttributes<TravelAuthorizationPreApprovalProfile>
>

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelAuthorizationPreApprovalProfileCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalProfile> {
    const { preApprovalId, profileName, department, ...optionalAttributes } = this.attributes

    if (isNil(preApprovalId)) {
      throw new Error("Pre-approval ID is required.")
    }

    if (isNil(profileName)) {
      throw new Error("Profile name is required.")
    }

    if (isNil(department)) {
      throw new Error("Department is required.")
    }

    const travelAuthorizationPreApprovalProfile =
      await TravelAuthorizationPreApprovalProfile.create({
        ...optionalAttributes,
        preApprovalId,
        profileName,
        department,
      })

    return travelAuthorizationPreApprovalProfile.reload({
      include: ["preApproval"],
    })
  }
}

export default CreateService
