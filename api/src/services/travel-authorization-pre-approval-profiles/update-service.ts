import { TravelAuthorizationPreApprovalProfile, User } from "@/models"

import BaseService from "@/services/base-service"

type TravelAuthorizationPreApprovalProfileUpdateAttributes =
  Partial<TravelAuthorizationPreApprovalProfile>

export class UpdateService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile,
    protected attributes: TravelAuthorizationPreApprovalProfileUpdateAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalProfile> {
    const { department, ...attributes } = this.attributes
    if (
      department !== undefined &&
      department !== this.travelAuthorizationPreApprovalProfile.department
    ) {
      throw new Error("Department cannot be changed.")
    }

    await this.travelAuthorizationPreApprovalProfile.update(attributes)
    return this.travelAuthorizationPreApprovalProfile.reload({
      include: ["preApproval"],
    })
  }
}

export default UpdateService
