import { isUndefined, pick } from "lodash"

import {
  AccountsReceivableInvoice,
  AccountsReceivableInvoiceDetail,
} from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AccountsReceivableInvoiceDetailIndexView = Pick<
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
> & {
  // TODO: move invoice type definition to accounts-receivable-invoice show serializer
  invoice: Pick<
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
  >
}

export class IndexSerializer extends BaseSerializer<AccountsReceivableInvoiceDetail> {
  constructor(protected record: AccountsReceivableInvoiceDetail) {
    super(record)
  }

  perform(): AccountsReceivableInvoiceDetailIndexView {
    if (isUndefined(this.record.invoice)) {
      throw new Error("'invoice' association is required")
    }

    return {
      ...pick(
        this.record,
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
      ),
      // TODO: move invoice serialization to accounts receivable invoice show serializer
      invoice: pick(
        this.record.invoice,
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
    }
  }
}
