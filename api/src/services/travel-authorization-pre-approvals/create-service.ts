import { CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import db, { TravelAuthorizationPreApproval, User } from "@/models"
import BaseService from "@/services/base-service"
import {
  CreateService as CreateProfileService,
  type TravelAuthorizationPreApprovalProfileCreationAttributes,
} from "@/services/travel-authorization-pre-approval-profiles"

type TravelAuthorizationPreApprovalCreationAttributes = Partial<
  CreationAttributes<TravelAuthorizationPreApproval>
> & {
  profilesAttributes?: TravelAuthorizationPreApprovalProfileCreationAttributes[]
}

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelAuthorizationPreApprovalCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApproval> {
    const { department, estimatedCost, location, profilesAttributes, ...optionalAttributes } =
      this.attributes

    if (typeof department !== "string" || department.trim() === "") {
      throw new Error("Department is required.")
    }

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
        department,
        estimatedCost,
        location,
        status: TravelAuthorizationPreApproval.Statuses.DRAFT,
      })

      for (const profileAttributes of profilesAttributes) {
        await CreateProfileService.perform(travelAuthorizationPreApproval, profileAttributes)
      }

      return travelAuthorizationPreApproval.reload({
        include: ["submission"],
      })
    })
  }
}

export default CreateService
