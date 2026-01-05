import { isUndefined, pick, sortBy, sumBy } from "lodash"

import {
  AccountsReceivableInvoice,
  AccountsReceivableInvoiceDetail,
  Segment,
} from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"
import {
  AccountsReceivableInvoiceDetails,
  Segments,
} from "@/integrations/trav-com-integration/serializers"

export type AccountsReceivableInvoiceAsShow = Pick<
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
> & {
  // computed fields
  totalCost: number
  // associations
  details: AccountsReceivableInvoiceDetails.AsReference[]
  segments: Segments.AsReference[]
}

export class ShowSerializer extends BaseSerializer<AccountsReceivableInvoice> {
  constructor(protected record: AccountsReceivableInvoice) {
    super(record)
  }

  perform(): AccountsReceivableInvoiceAsShow {
    const { details, segments } = this.record
    if (isUndefined(details)) {
      throw new Error("Expected 'details' association to be pre-loaded")
    }

    if (isUndefined(segments)) {
      throw new Error("Expected 'segments' association to be pre-loaded")
    }

    const totalCost = this.computeTotalCost(details)
    const serializedDetails = this.serializeDetails(details)
    const serializedSegments = this.serializeSegments(segments)

    return {
      ...pick(this.record, [
        "id",
        "invoiceNumber",
        "profileNumber",
        "profileName",
        "departmentMailcode",
        "bookingDate",
        "systemDate",
        "description",
        "invoiceRemarks",
      ]),
      // computed fields
      totalCost,
      // associations
      details: serializedDetails,
      segments: serializedSegments,
    }
  }

  private computeTotalCost(details: AccountsReceivableInvoiceDetail[]): number {
    return sumBy(details, (detail) => Number(detail.grossAmount) || 0)
  }

  private serializeDetails(
    details: AccountsReceivableInvoiceDetail[]
  ): AccountsReceivableInvoiceDetails.AsReference[] {
    return AccountsReceivableInvoiceDetails.ReferenceSerializer.perform(details)
  }

  private serializeSegments(segments: Segment[]): Segments.AsReference[] {
    const sortedSegments = sortBy(segments, "departureInfo")
    return Segments.ReferenceSerializer.perform(sortedSegments)
  }
}

export default ShowSerializer
