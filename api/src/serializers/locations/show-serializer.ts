import { pick } from "lodash"

import { Location, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type LocationAsShow = Pick<Location, "id" | "province" | "city" | "createdAt" | "updatedAt">

export class ShowSerializer extends BaseSerializer<Location> {
  constructor(
    protected record: Location,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): LocationAsShow {
    return pick(this.record, ["id", "province", "city", "createdAt", "updatedAt"])
  }
}

export default ShowSerializer
