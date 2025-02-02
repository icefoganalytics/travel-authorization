import { isUndefined, pick } from "lodash"

import { ArInvoice, ArInvoiceDetail } from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ArInvoiceIndexView = Pick<
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

export class IndexSerializer extends BaseSerializer<ArInvoice> {
  constructor(protected record: ArInvoice) {
    super(record)
  }

  perform(): ArInvoiceIndexView {
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
