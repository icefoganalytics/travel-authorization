import { isUndefined, pick } from "lodash"

import {
  AccountsReceivableInvoice,
  ArInvoiceDetail,
} from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AccountsReceivableInvoiceIndexView = Pick<
  AccountsReceivableInvoice,
  | "id"
  | "invoiceNumber"
  | "profileNumber"
  | "profileName"
  | "department"
  | "bookingDate"
  | "systemDate"
  | "description"
  | "invoiceRemarks"
> & {
  // TODO: move detail type definition to ar-invoice-detail serializer
  details: Pick<
    ArInvoiceDetail,
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
  >[]
}

export class IndexSerializer extends BaseSerializer<AccountsReceivableInvoice> {
  constructor(protected record: AccountsReceivableInvoice) {
    super(record)
  }

  perform(): AccountsReceivableInvoiceIndexView {
    if (isUndefined(this.record.details)) {
      throw new Error("'details' association is required")
    }

    return {
      ...pick(
        this.record,
        "id",
        "invoiceNumber",
        "profileNumber",
        "profileName",
        "department",
        "bookingDate",
        "systemDate",
        "description",
        "invoiceRemarks"
      ),
      // TODO: move detail serialization to its own serializer
      details: this.record.details.map((detail) =>
        pick(
          detail,
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
          "addedBy"
        )
      ),
    }
  }
}
