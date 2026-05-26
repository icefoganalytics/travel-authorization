import { pick } from "lodash"

import { TravelAllowance, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAllowanceAsIndex = Pick<
  TravelAllowance,
  "id" | "allowanceType" | "amount" | "currency" | "createdAt" | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<TravelAllowance> {
  constructor(
    protected record: TravelAllowance,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAllowanceAsIndex {
    return pick(this.record, [
      "id",
      "allowanceType",
      "amount",
      "currency",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default IndexSerializer
