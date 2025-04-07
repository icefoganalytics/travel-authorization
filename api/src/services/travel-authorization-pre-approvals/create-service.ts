import { CreationAttributes } from "sequelize"

import { isEmpty, isNil } from "lodash"

import db, {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalProfile,
  User,
} from "@/models"
import BaseService from "@/services/base-service"
import { TravelAuthorizationPreApprovalProfiles } from "@/services"

type TravelAuthorizationPreApprovalCreationAttributes = Partial<
  CreationAttributes<TravelAuthorizationPreApproval>
> & {
  profilesAttributes?: CreationAttributes<TravelAuthorizationPreApprovalProfile>[]
}

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelAuthorizationPreApprovalCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApproval> {
    const { estimatedCost, location, profilesAttributes, ...optionalAttributes } = this.attributes

    if (isNil(estimatedCost)) {
      throw new Error("Estimated cost is required.")
    }

    if (isNil(location)) {
      throw new Error("Location is required.")
    }

    if (isNil(profilesAttributes) || isEmpty(profilesAttributes)) {
      throw new Error("At least one pre-approval profile is required.")
    }

    return db.transaction(async () => {
      const travelAuthorizationPreApproval = await TravelAuthorizationPreApproval.create({
        ...optionalAttributes,
        creatorId: this.currentUser.id,
        estimatedCost,
        location,
        status: TravelAuthorizationPreApproval.Statuses.DRAFT,
      })

      for (const profileAttributes of profilesAttributes) {
        const safeProfileAttributes = {
          ...profileAttributes,
          preApprovalId: travelAuthorizationPreApproval.id,
        }
        await TravelAuthorizationPreApprovalProfiles.CreateService.perform(
          safeProfileAttributes,
          this.currentUser
        )
      }

      return travelAuthorizationPreApproval.reload({
        include: ["submission"],
      })
    })
  }
}

export default CreateService
