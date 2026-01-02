import { pick } from "lodash"

import { TravelPurpose, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelPurposeAsShow = Pick<TravelPurpose, "id" | "purpose" | "createdAt" | "updatedAt">

export class ShowSerializer extends BaseSerializer<TravelPurpose> {
  constructor(
    protected record: TravelPurpose,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelPurposeAsShow {
    return pick(this.record, ["id", "purpose", "createdAt", "updatedAt"])
  }
}

export default ShowSerializer
