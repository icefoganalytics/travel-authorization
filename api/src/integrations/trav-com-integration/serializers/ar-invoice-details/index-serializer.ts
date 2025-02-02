import { isUndefined, pick } from "lodash"

import { ArInvoice, ArInvoiceDetail } from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ArInvoiceDetailIndexView = Pick<
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
> & {
  // TODO: move invoice type definition to ar-invoice show serializer
  invoice: Pick<
    ArInvoice,
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

export class IndexSerializer extends BaseSerializer<ArInvoiceDetail> {
  constructor(protected record: ArInvoiceDetail) {
    super(record)
  }

  perform(): ArInvoiceDetailIndexView {
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
      // TODO: move invoice serialization to ar invoice show serializer
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
