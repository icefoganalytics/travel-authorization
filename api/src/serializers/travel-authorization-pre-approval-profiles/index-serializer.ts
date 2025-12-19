import { isUndefined, pick } from "lodash"

import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { TravelAuthorizationPreApprovals } from "@/serializers"

export type TravelAuthorizationPreApprovalProfileIndexView = Pick<
  TravelAuthorizationPreApprovalProfile,
  "id" | "preApprovalId" | "profileName" | "department" | "branch" | "createdAt" | "updatedAt"
> & {
  preApproval: TravelAuthorizationPreApprovals.AsReference
}

export class IndexSerializer extends BaseSerializer<TravelAuthorizationPreApprovalProfile> {
  perform(): TravelAuthorizationPreApprovalProfileIndexView {
    const { preApproval } = this.record
    if (isUndefined(preApproval)) {
      throw new Error("Expected preApproval association to be pre-loaded.")
    }

    const serializedPreApproval = this.serializePreApproval(preApproval)

    return {
      ...pick(this.record, [
        "id",
        "preApprovalId",
        "profileName",
        "department",
        "branch",
        "createdAt",
        "updatedAt",
      ]),
      preApproval: serializedPreApproval,
    }
  }

  private serializePreApproval(
    preApproval: TravelAuthorizationPreApproval
  ): TravelAuthorizationPreApprovals.AsReference {
    return TravelAuthorizationPreApprovals.ReferenceSerializer.perform(preApproval)
  }
}

export default IndexSerializer
