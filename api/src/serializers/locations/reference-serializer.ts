import { pick } from "lodash"

import { Location } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type LocationAsReference = Pick<
  Location,
  "id" | "city" | "province" | "createdAt" | "updatedAt"
>

export class ReferenceSerializer extends BaseSerializer<Location> {
  perform(): LocationAsReference {
    return pick(this.record, ["id", "city", "province", "createdAt", "updatedAt"])
  }
}

export default ReferenceSerializer
