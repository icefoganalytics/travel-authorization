import { pick } from "lodash"

import { GeneralLedgerCoding, User } from "@/models"
import { GeneralLedgerCodingsPolicy } from "@/policies"
import BaseSerializer from "@/serializers/base-serializer"

export type GeneralLedgerCodingAsIndex = Pick<
  GeneralLedgerCoding,
  "id" | "travelAuthorizationId" | "code" | "amount" | "createdAt" | "updatedAt"
> & {
  policy: GeneralLedgerCodingsPolicy
}

export class IndexSerializer extends BaseSerializer<GeneralLedgerCoding> {
  constructor(
    protected record: GeneralLedgerCoding,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): GeneralLedgerCodingAsIndex {
    const policy = this.buildGeneralLedgerCodingsPolicy(this.currentUser, this.record)

    return {
      ...pick(this.record, [
        "id",
        "travelAuthorizationId",
        "code",
        "amount",
        "createdAt",
        "updatedAt",
      ]),
      policy,
    }
  }

  private buildGeneralLedgerCodingsPolicy(
    currentUser: User,
    generalLedgerCoding: GeneralLedgerCoding
  ) {
    return new GeneralLedgerCodingsPolicy(currentUser, generalLedgerCoding)
  }
}

export default IndexSerializer
