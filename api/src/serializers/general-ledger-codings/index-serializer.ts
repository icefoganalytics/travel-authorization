import { pick } from "lodash"

import { GeneralLedgerCoding } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type GeneralLedgerCodingAsIndex = Pick<
  GeneralLedgerCoding,
  "id" | "travelAuthorizationId" | "code" | "amount" | "createdAt" | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<GeneralLedgerCoding> {
  perform(): GeneralLedgerCodingAsIndex {
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

export default IndexSerializer
