import { pick } from "lodash"

import { PerDiem, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type PerDiemAsShow = Pick<
  PerDiem,
  "id" | "claimType" | "travelRegion" | "amount" | "currency" | "createdAt" | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<PerDiem> {
  constructor(
    protected record: PerDiem,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): PerDiemAsShow {
    return pick(this.record, [
      "id",
      "claimType",
      "travelRegion",
      "amount",
      "currency",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default ShowSerializer
