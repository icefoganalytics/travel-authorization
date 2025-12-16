import { pick } from "lodash"

import { TravelPurpose, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelPurposeAsReference = Pick<
  TravelPurpose,
  "id" | "purpose" | "createdAt" | "updatedAt"
>

export class ReferenceSerializer extends BaseSerializer<TravelPurpose> {
  constructor(
    protected record: TravelPurpose,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelPurposeAsReference {
    return pick(this.record, ["id", "purpose", "createdAt", "updatedAt"])
  }
}

export default ReferenceSerializer
