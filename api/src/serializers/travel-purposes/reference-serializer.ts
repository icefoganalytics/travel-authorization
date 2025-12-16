import { pick } from "lodash"

import { TravelPurpose } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelPurposeAsReference = Pick<
  TravelPurpose,
  "id" | "purpose" | "createdAt" | "updatedAt"
>

export class ReferenceSerializer extends BaseSerializer<TravelPurpose> {
  perform(): TravelPurposeAsReference {
    return pick(this.record, ["id", "purpose", "createdAt", "updatedAt"])
  }
}

export default ReferenceSerializer
