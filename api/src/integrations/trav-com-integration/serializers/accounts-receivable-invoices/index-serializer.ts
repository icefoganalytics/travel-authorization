import { pick } from "lodash"

import { AccountsReceivableInvoice } from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AccountsReceivableInvoiceAsIndex = Pick<
  AccountsReceivableInvoice,
  | "id"
  | "invoiceNumber"
  | "profileNumber"
  | "profileName"
  | "departmentMailcode"
  | "bookingDate"
  | "systemDate"
  | "description"
  | "invoiceRemarks"
>

export class IndexSerializer extends BaseSerializer<AccountsReceivableInvoice> {
  constructor(protected record: AccountsReceivableInvoice) {
    super(record)
  }

  perform(): AccountsReceivableInvoiceAsIndex {
    return pick(
      this.record,
      "id",
      "invoiceNumber",
      "profileNumber",
      "profileName",
      "departmentMailcode",
      "bookingDate",
      "systemDate",
      "description",
      "invoiceRemarks"
    )
  }
}

export default IndexSerializer
