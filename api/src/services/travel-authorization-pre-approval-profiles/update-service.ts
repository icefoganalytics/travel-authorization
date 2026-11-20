import { TravelAuthorizationPreApprovalProfile } from "@/models"

import BaseService from "@/services/base-service"

type TravelAuthorizationPreApprovalProfileUpdateAttributes = Partial<
  Pick<TravelAuthorizationPreApprovalProfile, "profileName" | "branch">
>

export class UpdateService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile,
    protected attributes: TravelAuthorizationPreApprovalProfileUpdateAttributes
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
