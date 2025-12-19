import { TravelAuthorizationPreApprovalProfile, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelAuthorizationPreApprovalProfile>

export class UpdateService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalProfile> {
    await this.travelAuthorizationPreApprovalProfile.update(this.attributes)
    return this.travelAuthorizationPreApprovalProfile.reload({
      include: ["preApproval"],
    })
  }
}

export default UpdateService
