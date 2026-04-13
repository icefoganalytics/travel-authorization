import { pick } from "lodash"

import { TravelAuthorizationPreApproval } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAuthorizationPreApprovalAsReference = Pick<
  TravelAuthorizationPreApproval,
  | "id"
  | "estimatedCost"
  | "location"
  | "purpose"
  | "startDate"
  | "endDate"
  | "isOpenForAnyDate"
  | "month"
  | "status"
  | "createdAt"
  | "updatedAt"
>

export class ReferenceSerializer extends BaseSerializer<TravelAuthorizationPreApproval> {
  perform(): TravelAuthorizationPreApprovalAsReference {
    return {
      ...pick(this.record, [
        "id",
        "estimatedCost",
        "location",
        "purpose",
        "startDate",
        "endDate",
        "isOpenForAnyDate",
        "month",
        "status",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ReferenceSerializer
