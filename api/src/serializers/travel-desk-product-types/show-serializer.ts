import { pick } from "lodash"

import { type TravelDeskProductType } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskProductTypeAsShow = Pick<
  TravelDeskProductType,
  "id" | "code" | "name" | "description"
>

export class ShowSerializer extends BaseSerializer<TravelDeskProductType> {
  perform(): TravelDeskProductTypeAsShow {
    return {
      ...pick(this.record, ["id", "code", "name", "description"]),
    }
  }
}

export default ShowSerializer
