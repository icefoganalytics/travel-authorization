import { pick } from "lodash"

import { GeneralLedgerCoding } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type GeneralLedgerCodingAsShow = Pick<
  GeneralLedgerCoding,
  "id" | "travelAuthorizationId" | "code" | "amount" | "createdAt" | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<GeneralLedgerCoding> {
  perform(): GeneralLedgerCodingAsShow {
    return {
      ...pick(this.record, [
        "id",
        "travelAuthorizationId",
        "code",
        "amount",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
