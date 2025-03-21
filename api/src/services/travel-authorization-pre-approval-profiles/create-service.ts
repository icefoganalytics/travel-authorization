import { CreationAttributes } from "sequelize"

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
    const { profileName, department, ...optionalAttributes } = this.attributes

    if (isNil(profileName)) {
      throw new Error("Profile name is required.")
    }

    if (isNil(department)) {
      throw new Error("Department is required.")
    }

    const travelAuthorizationPreApprovalProfile = await TravelAuthorizationPreApprovalProfile.create({
      ...optionalAttributes,
      profileName,
      department,
    })

    return travelAuthorizationPreApprovalProfile
  }
}

export default CreateService
