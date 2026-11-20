import { CreationAttributes } from "@sequelize/core"
import { isNil, isUndefined } from "lodash"

import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile } from "@/models"
import BaseService from "@/services/base-service"

export type TravelAuthorizationPreApprovalProfileCreationAttributes = Partial<
  Pick<CreationAttributes<TravelAuthorizationPreApprovalProfile>, "profileName" | "branch">
> & {
  department?: string | null
}

export class CreateService extends BaseService {
  constructor(
    protected preApproval: TravelAuthorizationPreApproval,
    protected attributes: TravelAuthorizationPreApprovalProfileCreationAttributes
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalProfile> {
    const { profileName, department, branch } = this.attributes

    if (isNil(profileName)) {
      throw new Error("Profile name is required.")
    }

    const parentDepartment = this.preApproval.department
    if (!isUndefined(department) && department !== parentDepartment) {
      throw new Error("Profile department must match the pre-approval department.")
    }

    const travelAuthorizationPreApprovalProfile =
      await TravelAuthorizationPreApprovalProfile.create({
        preApprovalId: this.preApproval.id,
        profileName,
        department: parentDepartment,
        branch,
      })

    return travelAuthorizationPreApprovalProfile.reload({
      include: ["preApproval"],
    })
  }
}

export default CreateService
