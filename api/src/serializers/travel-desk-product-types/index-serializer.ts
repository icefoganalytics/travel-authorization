import { pick } from "lodash"

import { type TravelDeskProductType } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskProductTypeAsIndex = Pick<
  TravelDeskProductType,
  "id" | "code" | "name" | "description"
>

export class IndexSerializer extends BaseSerializer<TravelDeskProductType> {
  perform(): TravelDeskProductTypeAsIndex {
    return {
      ...pick(this.record, ["id", "code", "name", "description"]),
    }
  }
}

export default IndexSerializer
