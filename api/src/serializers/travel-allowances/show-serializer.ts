import { pick } from "lodash"

import { TravelAllowance, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAllowanceAsShow = Pick<
  TravelAllowance,
  "id" | "allowanceType" | "amount" | "currency" | "createdAt" | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<TravelAllowance> {
  constructor(
    protected record: TravelAllowance,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAllowanceAsShow {
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

export default ShowSerializer
