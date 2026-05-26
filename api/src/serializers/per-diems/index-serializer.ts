import { pick } from "lodash"

import { PerDiem, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type PerDiemAsIndex = Pick<
  PerDiem,
  "id" | "claimType" | "travelRegion" | "amount" | "currency" | "createdAt" | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<PerDiem> {
  constructor(
    protected record: PerDiem,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): PerDiemAsIndex {
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

export default IndexSerializer
