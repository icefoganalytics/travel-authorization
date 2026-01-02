import { isUndefined, pick } from "lodash"

import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { TravelAuthorizationPreApprovals } from "@/serializers"

export type TravelAuthorizationPreApprovalProfileShowView = Pick<
  TravelAuthorizationPreApprovalProfile,
  "id" | "preApprovalId" | "profileName" | "department" | "branch" | "createdAt" | "updatedAt"
> & {
  preApproval: TravelAuthorizationPreApprovals.AsReference
}

export class ShowSerializer extends BaseSerializer<TravelAuthorizationPreApprovalProfile> {
  perform(): TravelAuthorizationPreApprovalProfileShowView {
    const { preApproval } = this.record
    if (isUndefined(preApproval)) {
      throw new Error("Expected preApproval association to be pre-loaded.")
    }

    const serializedTravelAuthorizationPreApproval =
      this.serializeTravelAuthorizationPreApproval(preApproval)

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
      preApproval: serializedTravelAuthorizationPreApproval,
    }
  }

  private serializeTravelAuthorizationPreApproval(
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval
  ): TravelAuthorizationPreApprovals.AsReference {
    return TravelAuthorizationPreApprovals.ReferenceSerializer.perform(
      travelAuthorizationPreApproval
    )
  }
}

export default ShowSerializer
