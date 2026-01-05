import { pick } from "lodash"

import { AccountsReceivableInvoiceDetail } from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AccountsReceivableInvoiceDetailAsReference = Pick<
  AccountsReceivableInvoiceDetail,
  | "id"
  | "invoiceId"
  | "transactionType"
  | "vendorNumber"
  | "vendorName"
  | "productCode"
  | "passengerName"
  | "ticketNumber"
  | "publishedFare"
  | "sellingFare"
  | "referenceFare"
  | "lowFare"
  | "tax1"
  | "grossAmount"
  | "commissionAmount"
  | "vatOnCommission"
  | "freeFieldA"
  | "travelDate"
  | "returnDate"
  | "numberOfDays"
  | "cityCode"
  | "profileNumber"
  | "addedBy"
>

export class ReferenceSerializer extends BaseSerializer<AccountsReceivableInvoiceDetail> {
  perform(): AccountsReceivableInvoiceDetailAsReference {
    return pick(this.record, [
      "id",
      "invoiceId",
      "transactionType",
      "vendorNumber",
      "vendorName",
      "productCode",
      "passengerName",
      "ticketNumber",
      "publishedFare",
      "sellingFare",
      "referenceFare",
      "lowFare",
      "tax1",
      "grossAmount",
      "commissionAmount",
      "vatOnCommission",
      "freeFieldA",
      "travelDate",
      "returnDate",
      "numberOfDays",
      "cityCode",
      "profileNumber",
      "addedBy",
    ])
  }
}

export default ReferenceSerializer
