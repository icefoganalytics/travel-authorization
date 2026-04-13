import { pick } from "lodash"

import { Location, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type LocationAsIndex = Pick<Location, "id" | "province" | "city" | "createdAt" | "updatedAt">

export class IndexSerializer extends BaseSerializer<Location> {
  constructor(
    protected record: Location,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): LocationAsIndex {
    return pick(this.record, ["id", "province", "city", "createdAt", "updatedAt"])
  }
}

export default IndexSerializer
